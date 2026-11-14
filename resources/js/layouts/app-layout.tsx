import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import UnyeBackdrop from '@/components/unye-backdrop';
import { useDarkTheme } from '@/lib/use-dark-theme';

export default function AppLayout({ children }: { children: ReactNode }) {
    const { locale } = usePage().props;
    const dark = useDarkTheme();

    // The layout persists across visits, so keep <html lang> in sync when the
    // visitor switches language without a full page load.
    useEffect(() => {
        document.documentElement.lang = locale.current;
    }, [locale.current]);

    return (
        // Isolated, so the backdrop can sit behind everything in here and
        // still be in front of the page background. The backdrop is a night
        // chart, so it only runs in the dark theme; light gets the plain page.
        <div className="isolate flex min-h-svh flex-col">
            {dark && <UnyeBackdrop />}
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-8 pb-16 sm:px-6">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
