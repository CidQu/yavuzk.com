import { usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/components/language-switcher';

export default function SiteFooter() {
    const { name } = usePage().props;

    return (
        <footer className="border-t bg-background/55 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
                    <span>
                        &copy; {new Date().getFullYear()} {name}
                    </span>
                    <span aria-hidden="true" className="opacity-40">
                        ·
                    </span>
                    {/* The backdrop is drawn from OpenStreetMap data. */}
                    <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Map data © OpenStreetMap contributors"
                        className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        &copy; OpenStreetMap
                    </a>
                </p>
                <LanguageSwitcher />
            </div>
        </footer>
    );
}
