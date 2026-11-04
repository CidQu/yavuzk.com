import { Head } from '@inertiajs/react';
import PhotoGallery from '@/components/photo-gallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutProps {
    title: string;
    fullName: string;
    photo: string;
    sections: { title: string; body: string }[];
    gallery: {
        title: string;
        description: string;
        photos: string[];
    };
}

export default function About({
    title,
    fullName,
    photo,
    sections,
    gallery,
}: AboutProps) {
    return (
        <>
            <Head title={title} />

            <Card className="rounded-4xl py-0">
                <CardContent className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
                    <img
                        src={photo}
                        alt={fullName}
                        className="w-full rounded-3xl ring-1 ring-foreground/10"
                    />
                    <div className="space-y-2">
                        <p className="text-base text-muted-foreground">{title}</p>
                        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            {fullName}
                        </h1>
                    </div>
                </CardContent>
            </Card>

            <section className="flex flex-col gap-4">
                {sections.map((section) => (
                    <Card key={section.title} className="gap-3 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base leading-relaxed whitespace-pre-line text-muted-foreground">
                                {section.body.trim()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <PhotoGallery {...gallery} />
        </>
    );
}
