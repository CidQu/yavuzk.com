import { Head } from '@inertiajs/react';
import PhotoGallery from '@/components/photo-gallery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

            <header className="flex items-center gap-5 py-6 sm:py-10">
                <Avatar className="size-20 border sm:size-24">
                    <AvatarImage
                        src={photo}
                        alt={fullName}
                        className="object-cover"
                    />
                    <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                        {fullName}
                    </h1>
                </div>
            </header>

            <div className="flex flex-col gap-10">
                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
                            {section.title}
                        </h2>
                        <p className="mt-4 leading-7 whitespace-pre-line text-muted-foreground">
                            {section.body.trim()}
                        </p>
                    </section>
                ))}

                <PhotoGallery {...gallery} />
            </div>
        </>
    );
}
