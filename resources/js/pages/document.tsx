import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

            <Card className="gap-4 rounded-4xl">
                <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-2 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <Link href={back.href}>
                            <HugeiconsIcon
                                icon={ArrowLeft02Icon}
                                strokeWidth={2}
                                data-icon="inline-start"
                            />
                            {back.label}
                        </Link>
                    </Button>
                    <h1 className="font-heading text-2xl font-semibold">
                        {title}
                    </h1>
                </CardHeader>
                <CardContent>
                    <div className="relative h-[70svh] overflow-hidden rounded-2xl bg-muted">
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
                </CardContent>
            </Card>
        </>
    );
}
