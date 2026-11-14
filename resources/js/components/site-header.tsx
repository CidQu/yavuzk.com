import { Link, usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/components/language-switcher';
import ThemeToggle from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function SiteHeader() {
    const { name, navigation } = usePage().props;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/55 backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-6 px-4 sm:px-6">
                <Link
                    href="/"
                    className="rounded-sm font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {name}
                </Link>

                <nav className="flex items-center gap-4 text-sm sm:gap-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className={cn(
                                'rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                item.active && 'font-medium text-foreground',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-1">
                    <LanguageSwitcher />
                    <Separator orientation="vertical" className="h-4!" />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
