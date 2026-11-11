import { usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/components/language-switcher';

export default function SiteFooter() {
    const { name } = usePage().props;

    return (
        <footer className="border-t">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} {name}
                </p>
                <LanguageSwitcher />
            </div>
        </footer>
    );
}
