import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

interface PhotoGalleryProps {
    title: string;
    description: string;
    photos: string[];
}

const lightboxControl =
    'border-white/15 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white disabled:opacity-0';

export default function PhotoGallery({
    title,
    description,
    photos,
}: PhotoGalleryProps) {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <section id="photos">
            <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
                {title}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {photos.map((src, index) => (
                        <li key={src}>
                            <button
                                type="button"
                                onClick={() => setSelected(index)}
                                className="group block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <img
                                    src={src}
                                    alt={`${title} ${index + 1}`}
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <Dialog
                open={selected !== null}
                onOpenChange={(open) => !open && setSelected(null)}
            >
                <DialogContent
                    showCloseButton={false}
                    className="overflow-hidden border-0 bg-black p-0 sm:max-w-4xl"
                >
                    <DialogTitle className="sr-only">{title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {description}
                    </DialogDescription>
                    <Carousel
                        opts={{ startIndex: selected ?? 0, loop: true }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-0">
                            {photos.map((src, index) => (
                                <CarouselItem
                                    key={src}
                                    className="flex h-[80svh] items-center justify-center pl-0"
                                >
                                    <img
                                        src={src}
                                        alt={`${title} ${index + 1}`}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious
                            size="icon"
                            className={`left-3 ${lightboxControl}`}
                        />
                        <CarouselNext
                            size="icon"
                            className={`right-3 ${lightboxControl}`}
                        />
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`absolute top-3 right-3 rounded-full ${lightboxControl}`}
                            >
                                <XIcon />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </Carousel>
                </DialogContent>
            </Dialog>
        </section>
    );
}
