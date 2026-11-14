import { useEffect, useRef, useState } from 'react';
import type { Reading } from '@/lib/unye/backdrop';

/** Ünye town centre, shown while the pointer is not on the map. */
const HOME = { latitude: 41.1262, longitude: 37.2854 };

const degrees = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(4)}° ${value < 0 ? negative : positive}`;

const position = ({ latitude, longitude }: typeof HOME) =>
    `${degrees(latitude, 'N', 'S')}  ${degrees(longitude, 'E', 'W')}`;

/**
 * The page backdrop: a live chart of Ünye's stretch of the Black Sea coast.
 * Swell rolls in to the shoreline, the pointer sends its own waves to shore
 * over water and lights up the terrain over land, and a small readout in the
 * corner says where on the map the pointer is.
 *
 * The renderer and its terrain data load after the page is interactive, and
 * all of this simply stays hidden if the browser cannot draw it.
 */
export default function UnyeBackdrop() {
    const canvas = useRef<HTMLCanvasElement>(null);
    const coordinates = useRef<HTMLSpanElement>(null);
    const height = useRef<HTMLSpanElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const element = canvas.current;

        if (!element) {
            return;
        }

        const abort = new AbortController();
        let backdrop: { destroy(): void } | undefined;

        // Written straight to the DOM: this fires on every pointer move.
        const onReading = (reading: Reading | null) => {
            if (coordinates.current && height.current) {
                coordinates.current.textContent = position(reading ?? HOME);
                height.current.textContent = reading
                    ? `${reading.atSea ? '≈' : '▲'} ${Math.round(reading.metres)} m`
                    : '';
            }
        };

        const mount = async () => {
            try {
                const { mountBackdrop } = await import('@/lib/unye/backdrop');

                backdrop = await mountBackdrop(
                    element,
                    { onFirstFrame: () => setReady(true), onReading },
                    abort.signal,
                );
            } catch (error) {
                // No hardware WebGL 2, no network, or we were unmounted: the
                // page simply keeps its plain background.
                if (import.meta.env.DEV && !abort.signal.aborted) {
                    console.warn('Ünye backdrop unavailable:', error);
                }
            }
        };

        const idle = window.requestIdleCallback
            ? window.requestIdleCallback(mount, { timeout: 1200 })
            : window.setTimeout(mount, 200);

        return () => {
            abort.abort();
            backdrop?.destroy();

            if (window.cancelIdleCallback) {
                window.cancelIdleCallback(idle);
            } else {
                window.clearTimeout(idle);
            }
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvas}
                aria-hidden="true"
                data-ready={ready || undefined}
                className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-screen w-full opacity-0 transition-opacity duration-1000 ease-out data-ready:opacity-100 supports-[height:100lvh]:h-lvh print:hidden"
            />

            {/* Above the page footer, which would otherwise frost it over. */}
            <p
                aria-hidden="true"
                data-ready={ready || undefined}
                className="pointer-events-none fixed bottom-5 left-6 z-10 hidden font-mono text-[0.6875rem] leading-5 tracking-[0.08em] whitespace-pre text-muted-foreground/70 opacity-0 transition-opacity duration-1000 ease-out data-ready:opacity-100 min-[1400px]:block print:hidden"
            >
                <span className="font-brand tracking-[0.28em] text-foreground/80">
                    ÜNYE
                </span>
                <br />
                <span ref={coordinates}>{position(HOME)}</span>
                <br />
                <span ref={height} />
            </p>
        </>
    );
}
