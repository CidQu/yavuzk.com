import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    return () => observer.disconnect();
};

/**
 * Whether the dark theme is on. Follows the `dark` class on <html>, which the
 * inline script in app.blade.php sets before first paint and ThemeToggle flips.
 */
export function useDarkTheme(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => document.documentElement.classList.contains('dark'),
        () => true,
    );
}
