/**
 * Loader for unye.bin, the terrain pack built by scripts/build-unye-map.py.
 *
 * Positions are in "map units": Web Mercator pixels at zoom 11 (about 58 m
 * each here), measured from the top-left corner of the pack.
 */

export interface Field {
    width: number;
    height: number;
    /** Map units per sample. */
    step: number;
    data: Float32Array;
}

export interface Terrain {
    /** Extent of the pack, in map units. */
    width: number;
    height: number;
    metresPerUnit: number;
    /** Bounding box of the Ünye district: [left, top, right, bottom]. */
    district: [number, number, number, number];
    /** Ünye town centre. */
    town: [number, number];
    /** Signed distance to the coastline in map units: positive at sea. */
    coast: Field;
    /** Signed distance to the district boundary in map units: negative inside. */
    boundary: Field;
    /** Height above sea level in metres. */
    elevation: Field;
    /** Longitude and latitude of a map position. */
    toLonLat(x: number, y: number): [number, number];
}

interface LayerHeader {
    width: number;
    height: number;
    bytes: 1 | 2;
    scale?: number;
    max?: number;
}

interface Header {
    width: number;
    height: number;
    mercator: { size: number; x: number; y: number };
    metresPerUnit: number;
    district: [number, number, number, number];
    town: [number, number];
    layers: Record<'coast' | 'district' | 'elevation', LayerHeader>;
}

/**
 * Each sample is stored as the zigzagged difference from its left, upper and
 * upper-left neighbours (16-bit layers as a plane of low bytes followed by a
 * plane of high bytes). The typed array wraps on overflow, mirroring the
 * encoder.
 */
function unpackLayer(bytes: Uint8Array, offset: number, layer: LayerHeader) {
    const { width, height } = layer;
    const count = width * height;
    const out =
        layer.bytes === 2 ? new Int16Array(count) : new Int8Array(count);

    for (let y = 0, i = 0; y < height; y++) {
        for (let x = 0; x < width; x++, i++) {
            const zigzag =
                layer.bytes === 2
                    ? bytes[offset + i] | (bytes[offset + count + i] << 8)
                    : bytes[offset + i];
            let value = (zigzag >>> 1) ^ -(zigzag & 1);

            if (x > 0) value += out[i - 1];
            if (y > 0) value += out[i - width];
            if (x > 0 && y > 0) value -= out[i - width - 1];

            out[i] = value;
        }
    }

    return out;
}

async function gunzip(response: Response): Promise<Uint8Array> {
    const body = response.body;

    if (!body || typeof DecompressionStream === 'undefined') {
        throw new Error('Streaming decompression is not available.');
    }

    const stream = body.pipeThrough(new DecompressionStream('gzip'));

    return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function loadTerrain(
    url: string,
    signal?: AbortSignal,
): Promise<Terrain> {
    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`Terrain request failed (${response.status}).`);
    }

    const bytes = await gunzip(response);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (
        view.getUint32(0, true) !== 0x45594e55 ||
        view.getUint16(4, true) !== 1
    ) {
        throw new Error('Unrecognised terrain pack.');
    }

    const headerLength = view.getUint16(6, true);
    const header = JSON.parse(
        new TextDecoder().decode(bytes.subarray(8, 8 + headerLength)),
    ) as Header;
    const { coast, district, elevation } = header.layers;

    let offset = 8 + headerLength;
    const field = (layer: LayerHeader, decode: (stored: number) => number) => {
        const stored = unpackLayer(bytes, offset, layer);
        const data = new Float32Array(stored.length);

        for (let i = 0; i < stored.length; i++) {
            data[i] = decode(stored[i]);
        }

        offset += stored.length * layer.bytes;

        return {
            width: layer.width,
            height: layer.height,
            step: header.width / layer.width,
            data,
        };
    };

    const coastScale = coast.scale ?? 1;
    const districtScale = district.scale ?? 1;
    const elevationMax = elevation.max ?? 1;
    const { mercator } = header;

    return {
        width: header.width,
        height: header.height,
        metresPerUnit: header.metresPerUnit,
        district: header.district,
        town: header.town,
        coast: field(coast, (v) => v * coastScale),
        boundary: field(district, (v) => v * districtScale),
        // Heights are stored as sqrt(h / max) in an unsigned byte.
        elevation: field(elevation, (v) => {
            const unit = (v & 255) / 255;

            return unit * unit * elevationMax;
        }),
        toLonLat(x, y) {
            const lon = ((x + mercator.x) / mercator.size) * 360 - 180;
            const n = Math.PI * (1 - (2 * (y + mercator.y)) / mercator.size);

            return [lon, (Math.atan(Math.sinh(n)) * 180) / Math.PI];
        },
    };
}

/** Bilinear sample of a field at a map position, clamped to its edges. */
export function sample(field: Field, x: number, y: number): number {
    const { width, height, data } = field;
    const fx = Math.min(Math.max(x / field.step - 0.5, 0), width - 1);
    const fy = Math.min(Math.max(y / field.step - 0.5, 0), height - 1);
    const x0 = Math.min(Math.floor(fx), width - 2);
    const y0 = Math.min(Math.floor(fy), height - 2);
    const tx = fx - x0;
    const ty = fy - y0;
    const i = y0 * width + x0;

    return (
        (data[i] * (1 - tx) + data[i + 1] * tx) * (1 - ty) +
        (data[i + width] * (1 - tx) + data[i + width + 1] * tx) * ty
    );
}

const clamp = (value: number, low: number, high: number) =>
    Math.min(Math.max(value, low), high);

/** Bakes a hillshade lit from the north-west: 0.5 on level ground. */
export function hillshade(
    elevation: Field,
    metresPerUnit: number,
): Float32Array {
    const { width, height, data } = elevation;
    const shade = new Float32Array(width * height);
    const run = 8 * elevation.step * metresPerUnit;
    const exaggeration = 2.4;
    const at = (x: number, y: number) =>
        data[clamp(y, 0, height - 1) * width + clamp(x, 0, width - 1)];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Sobel slopes, in metres of rise per metre of run.
            const east =
                at(x + 1, y - 1) +
                2 * at(x + 1, y) +
                at(x + 1, y + 1) -
                (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
            const south =
                at(x - 1, y + 1) +
                2 * at(x, y + 1) +
                at(x + 1, y + 1) -
                (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
            const nx = (-east / run) * exaggeration;
            const ny = (-south / run) * exaggeration;
            // The light sits to the upper left, halfway up the sky.
            const lit =
                (0.5 * -nx + 0.5 * -ny + Math.SQRT1_2) / Math.hypot(nx, ny, 1);

            shade[y * width + x] = clamp(
                0.5 + (lit - Math.SQRT1_2) * 0.9,
                0,
                1,
            );
        }
    }

    return shade;
}

/**
 * How far each point stands above or below the ground around it: 1 on a
 * ridge, 0 in a valley floor, 0.5 on even ground.
 */
export function prominence(elevation: Field): Float32Array {
    const { width, height, data } = elevation;
    const reach = Math.round(28 / elevation.step);
    const stride = width + 1;
    // A summed-area table makes the mean of any window four lookups.
    const sums = new Float64Array(stride * (height + 1));

    for (let y = 0; y < height; y++) {
        for (let x = 0, row = 0; x < width; x++) {
            row += data[y * width + x];
            sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + row;
        }
    }

    const lift = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
        const top = Math.max(y - reach, 0);
        const bottom = Math.min(y + reach + 1, height);

        for (let x = 0; x < width; x++) {
            const left = Math.max(x - reach, 0);
            const right = Math.min(x + reach + 1, width);
            const total =
                sums[bottom * stride + right] -
                sums[top * stride + right] -
                sums[bottom * stride + left] +
                sums[top * stride + left];
            const mean = total / ((bottom - top) * (right - left));

            lift[y * width + x] = clamp(
                0.5 + (data[y * width + x] - mean) / 180,
                0,
                1,
            );
        }
    }

    return lift;
}
