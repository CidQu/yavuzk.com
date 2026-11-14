import { usePage } from '@inertiajs/react';

export default function SiteFooter() {
    const { name } = usePage().props;

    return (
        <footer className="border-t">
            <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} {name}
                </p>
            </div>
        </footer>
    );
}
