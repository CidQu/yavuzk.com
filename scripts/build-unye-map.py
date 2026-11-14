#!/usr/bin/env python3
"""
Builds resources/js/lib/unye/unye.bin, the terrain pack behind the animated
Ünye backdrop (resources/js/components/unye-backdrop.tsx).

The pack holds three small rasters covering the Black Sea coast around Ünye:

    coast      signed distance to the coastline (+ at sea, - on land),
               smoothed offshore so that wave crests stay free of kinks
    district   signed distance to the Ünye district boundary (- inside)
    elevation  terrain height

Everything is expressed in "map units": Web Mercator pixels at zoom 11
(about 57.7 m each at this latitude), relative to the top-left of the extent.

Sources
    Coastline and district boundary: © OpenStreetMap contributors (ODbL),
        the `natural=coastline` ways and the admin boundary relations of
        Ünye and its coastal neighbours.
    Elevation: Mapzen/Tilezen Terrain Tiles on AWS (SRTM-derived).

Usage
    pip install numpy scipy pillow
    python scripts/build-unye-map.py [--cache DIR] [--preview FILE.png]

Downloads are cached, so re-runs are offline.
"""

from __future__ import annotations

import argparse
import gzip
import json
import math
import struct
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'resources/js/lib/unye/unye.bin'
USER_AGENT = 'unye-map-build/1.0'

ZOOM = 11
TILE_X = range(1231, 1241)
TILE_Y = range(763, 772)
ORIGIN_X, ORIGIN_Y = TILE_X[0] * 256, TILE_Y[0] * 256

# Extent of the pack, in zoom-11 pixels relative to the first tile.
EXTENT_X, EXTENT_Y, EXTENT_W, EXTENT_H = 288, 400, 1888, 1504

FIELD_STEP = 2       # map units per coast/district texel
ELEVATION_STEP = 4   # map units per elevation texel
SUPERSAMPLE = 4      # sub-samples per field texel when rasterising

COAST_QUANTUM = 1 / 8       # map units per stored step
COAST_LAND_CLAMP = -64.0    # nothing needs to know how far inland it is
DISTRICT_QUANTUM = 1 / 4
DISTRICT_CLAMP = 31.75
ELEVATION_MAX = 1800.0      # metres, stored as sqrt(e / max) in 8 bits

UNYE = 1806116
# Ünye plus the coastal districts either side, west to east.
RELATIONS = [1837374, 1837372, UNYE, 1839059, 1839067, 1839066]


def fetch(url: str, target: Path) -> Path:
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(request, timeout=120) as response:
            target.write_bytes(response.read())
        time.sleep(1)  # be polite to the public servers
    return target


def to_map(lon: float, lat: float) -> tuple[float, float]:
    size = 2**ZOOM * 256
    x = (lon + 180) / 360 * size
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * size
    return x - ORIGIN_X - EXTENT_X, y - ORIGIN_Y - EXTENT_Y


def load_relation(cache: Path, relation: int):
    """Returns (member ways as [(role, tags, [node ids])], {node id: (x, y)}, admin centre)."""
    path = fetch(
        f'https://api.openstreetmap.org/api/0.6/relation/{relation}/full',
        cache / f'relation-{relation}.xml',
    )
    root = ET.parse(path).getroot()
    nodes = {
        node.get('id'): to_map(float(node.get('lon')), float(node.get('lat')))
        for node in root.findall('node')
    }
    ways = {
        way.get('id'): (
            {tag.get('k'): tag.get('v') for tag in way.findall('tag')},
            [nd.get('ref') for nd in way.findall('nd')],
        )
        for way in root.findall('way')
    }
    element = next(r for r in root.findall('relation') if r.get('id') == str(relation))
    members, centre = [], None
    for member in element.findall('member'):
        if member.get('type') == 'way' and member.get('ref') in ways:
            members.append((member.get('role'), *ways[member.get('ref')]))
        elif member.get('role') == 'admin_centre':
            centre = nodes.get(member.get('ref'))
    return members, nodes, centre


def stitch(ways: list[list[str]]) -> list[list[str]]:
    """Chains ways that share end nodes into maximal polylines."""
    ways = [list(way) for way in ways]
    used = [False] * len(ways)
    chains = []
    for start in range(len(ways)):
        if used[start]:
            continue
        used[start] = True
        chain = ways[start]
        grew = True
        while grew:
            grew = False
            for index, way in enumerate(ways):
                if used[index]:
                    continue
                if way[0] == chain[-1]:
                    chain = chain + way[1:]
                elif way[-1] == chain[-1]:
                    chain = chain + way[-2::-1]
                elif way[-1] == chain[0]:
                    chain = way[:-1] + chain
                elif way[0] == chain[0]:
                    chain = way[:0:-1] + chain
                else:
                    continue
                used[index] = True
                grew = True
        chains.append(chain)
    return chains


def rasterise(polygons, step: float) -> np.ndarray:
    """Boolean mask of the polygons, sampled every `step` map units."""
    image = Image.new('L', (round(EXTENT_W / step), round(EXTENT_H / step)), 0)
    draw = ImageDraw.Draw(image)
    for polygon in polygons:
        draw.polygon([(x / step - 0.5, y / step - 0.5) for x, y in polygon], fill=255)
    return np.asarray(image) > 127


def signed_distance(mask: np.ndarray, step: float) -> np.ndarray:
    """Distance to the mask edge in map units, negative inside."""
    outside = ndimage.distance_transform_edt(~mask) - 0.5
    inside = ndimage.distance_transform_edt(mask) - 0.5
    return np.where(mask, -inside, outside) * step


def smoothstep(low: float, high: float, values: np.ndarray) -> np.ndarray:
    t = np.clip((values - low) / (high - low), 0, 1)
    return t * t * (3 - 2 * t)


def soften_offshore(coast: np.ndarray) -> np.ndarray:
    """
    Out at sea the exact distance field is creased wherever two shores are
    equally far away, which would put kinks in every wave crest. Blur those
    out, progressively more with distance, and leave the shallows exact.
    """
    water = np.maximum(coast, 0)
    near = ndimage.gaussian_filter(water, 14 / FIELD_STEP, mode='nearest')
    far = ndimage.gaussian_filter(water, 56 / FIELD_STEP, mode='nearest')
    blurred = near + (far - near) * smoothstep(70, 260, coast)
    return coast + (blurred - coast) * smoothstep(10, 46, coast)


def downsample(values: np.ndarray, factor: int) -> np.ndarray:
    height, width = values.shape
    return values.reshape(height // factor, factor, width // factor, factor).mean(axis=(1, 3))


def load_elevation(cache: Path) -> np.ndarray:
    mosaic = np.zeros((len(TILE_Y) * 256, len(TILE_X) * 256), np.float32)
    for column, x in enumerate(TILE_X):
        for row, y in enumerate(TILE_Y):
            path = fetch(
                f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png',
                cache / f'terrarium-{ZOOM}-{x}-{y}.png',
            )
            rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
            metres = rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
            mosaic[row * 256 : (row + 1) * 256, column * 256 : (column + 1) * 256] = metres
    return mosaic[EXTENT_Y : EXTENT_Y + EXTENT_H, EXTENT_X : EXTENT_X + EXTENT_W]


def pack_layer(values: np.ndarray, width_bytes: int) -> bytes:
    """
    Stores each sample as the zigzagged difference from its left, upper and
    upper-left neighbours. Smooth fields turn into runs of tiny numbers, which
    gzip then squeezes far better than the raw samples.
    """
    bits = 8 * width_bytes
    wrapped = values.astype(np.int64)
    residual = wrapped.copy()
    residual[:, 1:] -= wrapped[:, :-1]
    residual[1:, :] -= wrapped[:-1, :]
    residual[1:, 1:] += wrapped[:-1, :-1]
    # Wrap into the signed sample range; the decoder's typed arrays wrap back.
    half = 1 << (bits - 1)
    residual = (residual + half) % (1 << bits) - half
    zigzag = ((residual << 1) ^ (residual >> 63)).astype(np.uint64)
    if width_bytes == 1:
        return zigzag.astype(np.uint8).tobytes()
    # Low bytes then high bytes, so each plane compresses on its own terms.
    return (zigzag & 255).astype(np.uint8).tobytes() + (zigzag >> 8).astype(np.uint8).tobytes()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('--cache', type=Path, default=ROOT / 'storage/app/private/unye-map-cache')
    parser.add_argument('--preview', type=Path, help='also write a debug image of the three layers')
    args = parser.parse_args()

    coast_ways, coast_nodes, district_ring, town = [], {}, None, None
    for relation in RELATIONS:
        members, nodes, centre = load_relation(args.cache, relation)
        coast_nodes.update(nodes)
        coast_ways += [way for _, tags, way in members if tags.get('natural') == 'coastline']
        if relation == UNYE:
            (ring,) = stitch([way for role, _, way in members if role == 'outer'])
            district_ring = [nodes[node] for node in ring]
            town = centre

    chains = stitch(coast_ways)
    mainland = max(chains, key=len)
    islands = [chain for chain in chains if chain is not mainland and chain[0] == chain[-1]]
    shore = [coast_nodes[node] for node in mainland]
    if shore[0][0] > shore[-1][0]:
        shore.reverse()  # west to east
    # Close the mainland well outside the extent, around the south.
    far = 8000
    land = [(-far, shore[0][1]), *shore, (far, shore[-1][1]), (far, far), (-far, far)]

    fine = FIELD_STEP / SUPERSAMPLE
    land_mask = rasterise([land, *([coast_nodes[node] for node in island] for island in islands)], fine)
    coast = soften_offshore(downsample(signed_distance(land_mask, fine), SUPERSAMPLE))
    district = downsample(signed_distance(rasterise([district_ring], fine) & land_mask, fine), SUPERSAMPLE)

    elevation = downsample(np.maximum(load_elevation(args.cache), 0), ELEVATION_STEP)
    elevation *= downsample(rasterise([land], 1).astype(np.float32), ELEVATION_STEP) > 0.02

    coast_q = np.round(np.maximum(coast, COAST_LAND_CLAMP) / COAST_QUANTUM)
    district_q = np.round(np.clip(district, -DISTRICT_CLAMP, DISTRICT_CLAMP) / DISTRICT_QUANTUM)
    elevation_q = np.round(np.sqrt(np.minimum(elevation, ELEVATION_MAX) / ELEVATION_MAX) * 255)
    assert np.abs(coast_q).max() < 32768 and np.abs(district_q).max() < 128

    xs, ys = zip(*district_ring)
    size = 2**ZOOM * 256
    header = {
        'width': EXTENT_W,
        'height': EXTENT_H,
        # Enough to turn map units back into longitude / latitude.
        'mercator': {
            'size': size,
            'x': ORIGIN_X + EXTENT_X,
            'y': ORIGIN_Y + EXTENT_Y,
        },
        'metresPerUnit': round(
            40075016.686 * math.cos(math.radians(41.03)) / size, 3
        ),
        'district': [round(v, 1) for v in (min(xs), min(ys), max(xs), max(ys))],
        'town': [round(v, 1) for v in town],
        'layers': {
            'coast': {
                'width': coast_q.shape[1],
                'height': coast_q.shape[0],
                'bytes': 2,
                'scale': COAST_QUANTUM,
            },
            'district': {
                'width': district_q.shape[1],
                'height': district_q.shape[0],
                'bytes': 1,
                'scale': DISTRICT_QUANTUM,
            },
            'elevation': {
                'width': elevation_q.shape[1],
                'height': elevation_q.shape[0],
                'bytes': 1,
                'max': ELEVATION_MAX,
            },
        },
    }
    meta = json.dumps(header, separators=(',', ':')).encode()
    body = (
        b'UNYE'
        + struct.pack('<HH', 1, len(meta))
        + meta
        + pack_layer(coast_q, 2)
        + pack_layer(district_q, 1)
        + pack_layer(elevation_q, 1)
    )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    # mtime=0 keeps the output byte-identical between runs.
    OUTPUT.write_bytes(gzip.compress(body, 9, mtime=0))
    print(f'{OUTPUT.relative_to(ROOT)}: {OUTPUT.stat().st_size / 1024:.1f} KiB ({len(body) / 1024:.0f} KiB raw)')
    print(json.dumps({k: v for k, v in header.items() if k != 'layers'}))

    if args.preview:
        tiles = [
            np.clip((coast + 64) / 320, 0, 1),
            np.clip(district / 64 + 0.5, 0, 1),
            np.kron(np.sqrt(elevation / ELEVATION_MAX), np.ones((2, 2))),
        ]
        Image.fromarray((np.hstack(tiles) * 255).astype(np.uint8)).save(args.preview)


if __name__ == '__main__':
    main()
