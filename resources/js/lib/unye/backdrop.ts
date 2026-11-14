import { FRAGMENT_SHADER, MAX_WAVES, SUMMIT, VERTEX_SHADER } from './shaders';
import { hillshade, loadTerrain, prominence, sample } from './terrain';
import type { Terrain } from './terrain';
import terrainUrl from './unye.bin?url';

/** A wave sent from the pointer, riding in to the shore. */
interface Wave {
    /** Where its crest is centred, map units. */
    x: number;
    y: number;
    /** Distance to the shore when it set off and now, map units. */
    start: number;
    front: number;
    born: number;
    landed: number | null;
}

/** A ring of light that spreads over the land along lines of equal height. */
interface Ripple {
    /** Where it began, map units, and how high that is. */
    x: number;
    y: number;
    metres: number;
    born: number;
    strength: number;
    /** How far it carries, CSS pixels. */
    reach: number;
}

/** What lies under the pointer, for the readout in the corner of the page. */
export interface Reading {
    longitude: number;
    latitude: number;
    /** Height above sea level in metres; 0 at sea. */
    metres: number;
    atSea: boolean;
}

export interface BackdropHooks {
    /** Called once, when the first frame is on screen. */
    onFirstFrame?: () => void;
    /** Called as the pointer moves over the map, and with null as it leaves. */
    onReading?: (reading: Reading | null) => void;
}

/** Sea waves travel this fast offshore, CSS pixels a second. */
const WAVE_SPEED = 185;
/** How long a wave takes to break on the shore, and to give up at sea. */
const WAVE_SPLASH = 0.85;
const WAVE_LIFE = 10;
/** Land ripples cover this much height a second, and live this long. */
const RIPPLE_CLIMB = 150;
const RIPPLE_LIFE = 1.9;
const MAX_RIPPLES = 14;
/** Pointer travel between two waves or two ripples, CSS pixels. */
const WAVE_EVERY = 26;
const RIPPLE_EVERY = 58;
/** Limits on the drawing buffer: sharp enough, without cooking a laptop. */
const MAX_PIXEL_RATIO = 2;
const MAX_PIXELS = 5_000_000;
/** Shortest gap between frames in milliseconds, while busy and while idle. */
const BUSY_FRAME = 13;
const IDLE_FRAME = 30;

const clamp = (value: number, low: number, high: number) =>
    Math.min(Math.max(value, low), high);

export class Backdrop {
    private readonly gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private uniforms: Record<string, WebGLUniformLocation | null> = {};
    private glowTexture: WebGLTexture | null = null;

    /** Canvas size in CSS pixels, and buffer pixels per CSS pixel. */
    private width = 0;
    private height = 0;
    private pixel = 1;
    private quality = 1;
    /** Where the map sits: screen = map * scale + origin. */
    private scale = 1;
    private originX = 0;
    private originY = 0;

    /** Land marks: a brick-laid grid, one terrain sample each. */
    private cell = 12;
    private columns = 0;
    private rows = 0;
    private metres = new Float32Array(0);
    private marked = new Uint8Array(0);
    private glow = new Float32Array(0);
    private tint = new Float32Array(0);
    private glowBytes = new Uint8Array(0);
    private lit = false;
    private glowSent = false;

    private waves: Wave[] = [];
    private ripples: Ripple[] = [];
    private lastLanding = -Infinity;
    private readonly waveData = new Float32Array(MAX_WAVES * 4);
    private readonly waveShape = new Float32Array(MAX_WAVES * 4);

    private readonly pointer = {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        at: -Infinity,
        here: false,
        pressed: false,
        travel: 0,
        /** Whether the readout already shows this position. */
        read: true,
    };
    private hover = 0;

    private time = 0;
    private last = 0;
    private frame = 0;
    private slow = 0;
    private still: boolean;
    private shown = false;

    private readonly listeners = new AbortController();
    private readonly observer = new ResizeObserver(() => this.resize());
    private readonly motion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    );

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly terrain: Terrain,
        private readonly hooks: BackdropHooks = {},
    ) {
        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'low-power',
            // A decoration is not worth software rendering.
            failIfMajorPerformanceCaveat: true,
        });

        if (!gl) {
            throw new Error('WebGL 2 is not available.');
        }

        this.gl = gl;
        this.still = this.motion.matches;
        this.build();
        this.listen();
        this.observer.observe(canvas);
        this.resize();
        this.start();
    }

    destroy() {
        cancelAnimationFrame(this.frame);
        this.listeners.abort();
        this.observer.disconnect();
        this.gl.deleteProgram(this.program);
        this.program = null;
    }

    // ------------------------------------------------------------------ setup

    private listen() {
        const { canvas, pointer } = this;
        const options = { signal: this.listeners.signal, passive: true };

        const moved = (event: PointerEvent) => {
            // Coming back after a gap should not count as one long stroke.
            if (!pointer.here || this.time - pointer.at > 0.4) {
                pointer.lastX = event.clientX;
                pointer.lastY = event.clientY;
            }

            pointer.x = event.clientX;
            pointer.y = event.clientY;
            pointer.at = this.time;
            pointer.here = true;
            pointer.read = false;
            pointer.pressed ||= event.type === 'pointerdown';
        };
        const gone = () => {
            pointer.here = false;
            pointer.read = false;
        };
        // A finger or pen is only there while it touches the screen.
        const lifted = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') {
                gone();
            }
        };

        window.addEventListener('pointermove', moved, options);
        window.addEventListener('pointerdown', moved, options);
        window.addEventListener('pointerup', lifted, options);
        window.addEventListener('pointercancel', lifted, options);
        window.addEventListener('blur', gone, options);
        document.documentElement.addEventListener(
            'pointerleave',
            gone,
            options,
        );

        // Moving between screens changes the pixel ratio without resizing
        // the canvas box, which is all the observer watches.
        window.addEventListener('resize', () => this.resize(), options);
        document.addEventListener(
            'visibilitychange',
            () => this.start(),
            options,
        );
        this.motion.addEventListener(
            'change',
            () => {
                this.still = this.motion.matches;
                this.start();
            },
            options,
        );

        canvas.addEventListener(
            'webglcontextlost',
            (event) => {
                // Asks the browser to hand the context back when it can.
                event.preventDefault();
                cancelAnimationFrame(this.frame);
            },
            { signal: this.listeners.signal },
        );
        canvas.addEventListener(
            'webglcontextrestored',
            () => {
                this.build();
                this.width = 0;
                this.resize();
                this.start();
            },
            options,
        );
    }

    /** Compiles the shader and uploads the terrain. */
    private build() {
        const { gl, terrain } = this;
        const program = gl.createProgram();

        for (const [type, source] of [
            [gl.VERTEX_SHADER, VERTEX_SHADER],
            [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
        ] as const) {
            const shader = gl.createShader(type)!;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            gl.attachShader(program, shader);
        }

        gl.linkProgram(program);

        if (
            !gl.getProgramParameter(program, gl.LINK_STATUS) &&
            !gl.isContextLost()
        ) {
            throw new Error(
                gl.getProgramInfoLog(program) || 'The shader failed to build.',
            );
        }

        this.program = program;
        this.uniforms = {};
        gl.useProgram(program);
        gl.bindVertexArray(gl.createVertexArray());

        const active = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < active; i++) {
            const name = gl.getActiveUniform(program, i)?.name ?? '';

            // Arrays are listed by their first element.
            this.uniforms[name.replace('[0]', '')] = gl.getUniformLocation(
                program,
                name,
            );
        }

        const texture = (unit: number, filter: number) => {
            const created = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, created);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE,
            );

            return created;
        };

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        // Coast and district distances share a half-float texture.
        const { coast, boundary, elevation } = terrain;
        const field = new Float32Array(coast.data.length * 2);

        for (let i = 0; i < coast.data.length; i++) {
            field[i * 2] = coast.data[i];
            field[i * 2 + 1] = boundary.data[i];
        }

        texture(0, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RG16F,
            coast.width,
            coast.height,
            0,
            gl.RG,
            gl.FLOAT,
            field,
        );

        // Height (square-rooted, which keeps the lowlands precise in eight
        // bits), hillshade and prominence.
        const peak = elevation.data.reduce((a, b) => Math.max(a, b), 1);
        const shade = hillshade(elevation, terrain.metresPerUnit);
        const lift = prominence(elevation);
        const relief = new Uint8Array(elevation.data.length * 3);

        for (let i = 0; i < elevation.data.length; i++) {
            relief[i * 3] = Math.sqrt(elevation.data[i] / peak) * 255 + 0.5;
            relief[i * 3 + 1] = shade[i] * 255 + 0.5;
            relief[i * 3 + 2] = lift[i] * 255 + 0.5;
        }

        texture(1, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB8,
            elevation.width,
            elevation.height,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            relief,
        );

        this.glowTexture = texture(2, gl.NEAREST);

        gl.uniform1i(this.uniforms.uField, 0);
        gl.uniform1i(this.uniforms.uTerrain, 1);
        gl.uniform1i(this.uniforms.uGlow, 2);
        gl.uniform2f(this.uniforms.uMapSize, terrain.width, terrain.height);
        gl.uniform1f(this.uniforms.uElevationMax, peak);
    }

    private resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        if (width === 0 || height === 0 || this.gl.isContextLost()) {
            return;
        }

        const pixel = Math.max(
            Math.min(
                window.devicePixelRatio || 1,
                MAX_PIXEL_RATIO,
                Math.sqrt(MAX_PIXELS / (width * height)),
            ) * this.quality,
            0.75,
        );
        const sized = width !== this.width || height !== this.height;

        if (!sized && pixel === this.pixel) {
            return;
        }

        this.width = width;
        this.height = height;
        this.pixel = pixel;
        this.canvas.width = Math.round(width * pixel);
        this.canvas.height = Math.round(height * pixel);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        if (sized) {
            this.fit();
            this.layOutMarks();
        }

        if (this.still) {
            this.draw();
        }
    }

    /**
     * Frames the district: as large as fits with its coast a third of the way
     * down and the sea above it, never showing past the edge of the terrain.
     */
    private fit() {
        const { terrain, width, height } = this;
        const [left, top, right, bottom] = terrain.district;
        const inset = 30;

        this.scale = Math.max(
            Math.min(
                (width * 0.92) / (right - left),
                (height * 0.6) / (bottom - top),
            ),
            width / (terrain.width - 2 * inset),
            height / (terrain.height - 2 * inset),
        );
        this.originX = clamp(
            width / 2 - ((left + right) / 2) * this.scale,
            width - (terrain.width - inset) * this.scale,
            -inset * this.scale,
        );
        this.originY = clamp(
            height * 0.34 - top * this.scale,
            height - (terrain.height - inset) * this.scale,
            -inset * this.scale,
        );
    }

    /** Samples the terrain once under every land mark. */
    private layOutMarks() {
        const { gl, terrain } = this;

        this.cell = clamp(Math.round(this.scale * 11.5), 9, 16);
        // One spare column on the left: odd rows sit half a cell across.
        this.columns = Math.ceil(this.width / this.cell) + 2;
        this.rows = Math.ceil(this.height / this.cell) + 1;

        const count = this.columns * this.rows;

        this.metres = new Float32Array(count);
        this.marked = new Uint8Array(count);
        this.glow = new Float32Array(count);
        this.tint = new Float32Array(count);
        this.glowBytes = new Uint8Array(count * 2);
        this.lit = false;
        this.glowSent = false;

        for (let row = 0, i = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++, i++) {
                const x = this.toMapX(this.markX(column, row));
                const y = this.toMapY(this.markY(row));

                this.metres[i] = sample(terrain.elevation, x, y);
                // The shader draws nothing closer to the shore than this.
                this.marked[i] =
                    sample(terrain.coast, x, y) * this.scale < -4 ? 1 : 0;
            }
        }

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.glowTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RG8,
            this.columns,
            this.rows,
            0,
            gl.RG,
            gl.UNSIGNED_BYTE,
            this.glowBytes,
        );
    }

    private markX(column: number, row: number) {
        return (column - 0.5 + (row % 2) * 0.5) * this.cell;
    }

    private markY(row: number) {
        return (row + 0.5) * this.cell;
    }

    private toMapX(x: number) {
        return (x - this.originX) / this.scale;
    }

    private toMapY(y: number) {
        return (y - this.originY) / this.scale;
    }

    // ---------------------------------------------------------------- pointer

    /** Turns pointer travel into waves at sea and ripples on land. */
    private follow(dt: number) {
        const { pointer, terrain, hooks } = this;
        const x = this.toMapX(pointer.x);
        const y = this.toMapY(pointer.y);
        const offshore = sample(terrain.coast, x, y);
        const atSea = offshore > 0;
        const pressed = pointer.pressed;

        pointer.pressed = false;
        this.hover +=
            ((pointer.here && !atSea ? 1 : 0) - this.hover) *
            (1 - Math.exp(-dt / 0.09));

        if (!pointer.read) {
            pointer.read = true;

            if (pointer.here) {
                const [longitude, latitude] = terrain.toLonLat(x, y);
                const metres = atSea ? 0 : sample(terrain.elevation, x, y);

                hooks.onReading?.({ longitude, latitude, metres, atSea });
            } else {
                hooks.onReading?.(null);
            }
        }

        if (!pointer.here && !pressed) {
            return;
        }

        pointer.travel += Math.hypot(
            pointer.x - pointer.lastX,
            pointer.y - pointer.lastY,
        );
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;

        // A press always sends something; otherwise it takes some travel.
        if (atSea && (pressed || pointer.travel >= WAVE_EVERY)) {
            pointer.travel = 0;

            if (this.waves.length >= MAX_WAVES) {
                this.waves.shift();
            }

            this.waves.push({
                x,
                y,
                start: offshore,
                front: offshore,
                born: this.time,
                landed: null,
            });
        } else if (!atSea && (pressed || pointer.travel >= RIPPLE_EVERY)) {
            pointer.travel = 0;
            this.sendRipple(
                x,
                y,
                sample(terrain.elevation, x, y),
                pressed ? 1 : 0.8,
                (pressed ? 15 : 11) * this.cell,
            );
        }
    }

    private sendRipple(
        x: number,
        y: number,
        metres: number,
        strength: number,
        reach: number,
    ) {
        if (this.ripples.length >= MAX_RIPPLES) {
            this.ripples.shift();
        }

        this.ripples.push({ x, y, metres, born: this.time, strength, reach });
    }

    // -------------------------------------------------------------- animation

    /** Moves the pointer's waves towards the shore and breaks them on it. */
    private advanceWaves(dt: number) {
        const { waves, waveData, waveShape, scale, time } = this;
        const { coast } = this.terrain;

        for (let i = waves.length - 1; i >= 0; i--) {
            const wave = waves[i];
            // Swell slows down as the water gets shallow.
            const depth = (Math.max(wave.front, 0) * scale) / 150;
            const step =
                (WAVE_SPEED * (0.4 + 0.6 * Math.min(depth, 1)) * dt) / scale;

            if (wave.landed !== null) {
                // The crests behind the first still have to come ashore.
                wave.front = Math.max(wave.front - step, -16 / scale);

                if (time - wave.landed > WAVE_SPLASH) {
                    waves.splice(i, 1);
                }

                continue;
            }

            // Head straight down the slope of the distance field.
            const slopeX =
                sample(coast, wave.x + coast.step, wave.y) -
                sample(coast, wave.x - coast.step, wave.y);
            const slopeY =
                sample(coast, wave.x, wave.y + coast.step) -
                sample(coast, wave.x, wave.y - coast.step);
            const slope = Math.hypot(slopeX, slopeY) || 1;

            wave.x -= (slopeX / slope) * step;
            wave.y -= (slopeY / slope) * step;
            wave.front = sample(coast, wave.x, wave.y);

            if (wave.front <= 0) {
                wave.landed = time;

                // The wave carries on over the land, climbing from the shore.
                if (time - this.lastLanding > 0.09) {
                    this.lastLanding = time;
                    this.sendRipple(wave.x, wave.y, 0, 0.5, 7 * this.cell);
                }
            } else if (time - wave.born > WAVE_LIFE) {
                waves.splice(i, 1);
            }
        }

        waves.forEach((wave, i) => {
            const age = time - wave.born;
            const run = 1 - Math.max(wave.front, 0) / Math.max(wave.start, 1);
            const breaking =
                wave.landed === null ? 0 : (time - wave.landed) / WAVE_SPLASH;
            // Fades in as it leaves the pointer, and out as it breaks or tires.
            const strength =
                Math.min(age / 0.14, 1) *
                (1 - breaking) *
                clamp(WAVE_LIFE - age, 0, 1);

            waveData[i * 4] = wave.x * scale + this.originX;
            waveData[i * 4 + 1] = wave.y * scale + this.originY;
            waveData[i * 4 + 2] = wave.front * scale;
            waveData[i * 4 + 3] = 0.9 * strength;
            // The crest widens as it runs in, and again as it breaks.
            waveShape[i * 4] = (11 + 17 * run) * (1 + 0.7 * breaking);
            waveShape[i * 4 + 1] =
                wave.landed === null
                    ? 0
                    : 0.9 * Math.sin(Math.PI * Math.sqrt(breaking));
        });
    }

    /** Calls back for every land mark within reach of a point on screen. */
    private forMarksNear(
        x: number,
        y: number,
        reach: number,
        visit: (index: number, falloff: number) => void,
    ) {
        const { cell, columns, rows, marked } = this;
        const top = Math.max(Math.floor((y - reach) / cell), 0);
        const bottom = Math.min(Math.ceil((y + reach) / cell), rows - 1);
        const left = Math.max(Math.floor((x - reach) / cell), 0);
        const right = Math.min(Math.ceil((x + reach) / cell) + 1, columns - 1);

        for (let row = top; row <= bottom; row++) {
            for (let column = left; column <= right; column++) {
                const i = row * columns + column;
                const away =
                    ((this.markX(column, row) - x) ** 2 +
                        (this.markY(row) - y) ** 2) /
                    (reach * reach);

                if (marked[i] && away < 1) {
                    visit(i, (1 - away) * (1 - away));
                }
            }
        }
    }

    /** Works out how brightly every land mark should glow right now. */
    private light(dt: number) {
        const { glow, tint, metres, pointer, cell } = this;
        const raise = (i: number, value: number, colour: number) => {
            if (value > glow[i]) {
                glow[i] = value;
                tint[i] = colour;
            }
        };

        if (this.lit) {
            const keep = Math.exp(-dt / 0.38);
            let brightest = 0;

            for (let i = 0; i < glow.length; i++) {
                glow[i] *= keep;
                brightest = Math.max(brightest, glow[i]);
            }

            this.lit = brightest > 0.004;
        }

        // Under the pointer the land lights up by its relief: the high ground
        // around it brightest and warmest, the valleys least.
        if (this.hover > 0.01) {
            const reach = 6.4 * cell;
            let low = Infinity;
            let high = -Infinity;

            this.forMarksNear(pointer.x, pointer.y, reach, (i) => {
                low = Math.min(low, metres[i]);
                high = Math.max(high, metres[i]);
            });

            const span = Math.max(high - low, 60);

            this.forMarksNear(pointer.x, pointer.y, reach, (i, falloff) => {
                const relief = (metres[i] - low) / span;

                raise(
                    i,
                    this.hover * falloff * (0.22 + 0.78 * relief),
                    clamp(0.3 * (metres[i] / SUMMIT) + 0.7 * relief, 0, 1),
                );
            });
            this.lit = true;
        }

        // Ripples spread along the contours: a front that climbs and descends
        // from the height where it began.
        for (let r = this.ripples.length - 1; r >= 0; r--) {
            const ripple = this.ripples[r];
            const age = this.time - ripple.born;

            if (age > RIPPLE_LIFE) {
                this.ripples.splice(r, 1);
                continue;
            }

            const front = age * RIPPLE_CLIMB;
            const width = 15 + front * 0.09;
            const fade = ripple.strength * (1 - age / RIPPLE_LIFE) ** 1.4;

            this.forMarksNear(
                ripple.x * this.scale + this.originX,
                ripple.y * this.scale + this.originY,
                ripple.reach,
                (i, falloff) => {
                    const off =
                        (Math.abs(metres[i] - ripple.metres) - front) / width;

                    raise(
                        i,
                        fade * falloff * Math.exp(-off * off),
                        clamp(metres[i] / SUMMIT, 0, 1),
                    );
                },
            );
            this.lit = true;
        }
    }

    private draw() {
        const { gl, uniforms, glow, tint, glowBytes } = this;

        if (!this.program || gl.isContextLost()) {
            return;
        }

        // Only send the glow while something is lit, and once more to clear.
        if (this.lit || this.glowSent) {
            for (let i = 0; i < glow.length; i++) {
                glowBytes[i * 2] = this.lit ? Math.min(glow[i], 1) * 255 : 0;
                glowBytes[i * 2 + 1] = tint[i] * 255;
            }

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.glowTexture);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                0,
                0,
                this.columns,
                this.rows,
                gl.RG,
                gl.UNSIGNED_BYTE,
                glowBytes,
            );
            this.glowSent = this.lit;
        }

        gl.uniform2f(
            uniforms.uResolution,
            this.canvas.width,
            this.canvas.height,
        );
        gl.uniform1f(uniforms.uPixel, this.pixel);
        gl.uniform1f(uniforms.uTime, this.time);
        gl.uniform2f(uniforms.uOrigin, this.originX, this.originY);
        gl.uniform1f(uniforms.uScale, this.scale);
        gl.uniform1f(uniforms.uCell, this.cell);
        gl.uniform1i(uniforms.uWaveCount, this.waves.length);
        gl.uniform4fv(uniforms.uWaves, this.waveData);
        gl.uniform4fv(uniforms.uWaveShape, this.waveShape);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        if (!this.shown) {
            this.shown = true;
            this.hooks.onFirstFrame?.();
        }
    }

    /** Starts, restarts or pauses the loop to suit the page's state. */
    private start() {
        cancelAnimationFrame(this.frame);

        if (document.hidden || this.listeners.signal.aborted) {
            return;
        }

        if (this.still) {
            // Reduced motion: one quiet frame and no loop.
            this.time = 2.4;
            this.draw();

            return;
        }

        this.last = performance.now();
        this.frame = requestAnimationFrame(this.tick);
    }

    private readonly tick = (now: number) => {
        this.frame = requestAnimationFrame(this.tick);

        // Busy while the pointer is on the move or its waves are in flight.
        // A pointer at rest keeps its patch of land lit, but nothing changes.
        const { pointer } = this;
        const busy =
            this.waves.length > 0 ||
            this.ripples.length > 0 ||
            !pointer.read ||
            this.time - pointer.at < 1.5;

        // Sixty frames a second is plenty, whatever the display can do, and
        // the swell alone is slow enough to draw at half that.
        if (now - this.last < (busy ? BUSY_FRAME : IDLE_FRAME)) {
            return;
        }

        const elapsed = Math.min((now - this.last) / 1000, 0.1);

        this.last = now;
        this.time += elapsed;
        this.follow(elapsed);
        this.advanceWaves(elapsed);
        this.light(elapsed);
        this.draw();

        // Drop the drawing resolution if the device cannot keep up: anything
        // smoother than two dozen frames a second is left alone.
        this.slow =
            elapsed > (busy ? 0.042 : 0.068)
                ? this.slow + 1
                : Math.max(this.slow - 2, 0);

        if (this.slow > 45 && this.quality > 0.5) {
            this.slow = 0;
            this.quality *= 0.8;
            this.resize();
        }
    };
}

/** Loads the terrain and starts drawing it on the canvas. */
export async function mountBackdrop(
    canvas: HTMLCanvasElement,
    hooks: BackdropHooks,
    signal: AbortSignal,
): Promise<Backdrop> {
    const terrain = await loadTerrain(terrainUrl, signal);

    signal.throwIfAborted();

    return new Backdrop(canvas, terrain, hooks);
}
