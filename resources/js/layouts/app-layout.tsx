import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';

export default function AppLayout({ children }: { children: ReactNode }) {
    const { locale } = usePage().props;

    // The layout persists across visits, so keep <html lang> in sync when the
    // visitor switches language without a full page load.
    useEffect(() => {
        document.documentElement.lang = locale.current;
    }, [locale.current]);

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-10 pb-16 sm:px-6">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
