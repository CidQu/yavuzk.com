import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SiteHeader() {
    const { name, navigation } = usePage().props;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
                <Link
                    href="/"
                    className="rounded-md font-brand text-lg font-semibold tracking-[0.06em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    {name}
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                    {navigation.map((item) => (
                        <Button
                            key={item.href}
                            asChild
                            variant="ghost"
                            className={cn(
                                'px-3.5 text-[0.95rem] font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                item.active && 'bg-accent text-accent-foreground',
                            )}
                        >
                            <Link
                                href={item.href}
                                aria-current={item.active ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
            </div>
        </header>
    );
}
