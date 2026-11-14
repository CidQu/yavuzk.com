import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentProps {
    title: string;
    source: string;
    back: { label: string; href: string };
}

export default function Document({ title, source, back }: DocumentProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <Head title={title} />

            <div className="flex flex-col items-start gap-3">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-2.5 text-muted-foreground"
                >
                    <Link href={back.href}>
                        <ArrowLeftIcon />
                        {back.label}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>

            <div className="relative h-[75svh] overflow-hidden rounded-xl border bg-muted shadow-sm">
                {!loaded && (
                    <Skeleton className="absolute inset-0 rounded-none" />
                )}
                <iframe
                    src={source}
                    title={title}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    className="relative size-full border-0"
                />
            </div>
        </>
    );
}
