'use client'

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface VehicleGalleryProps {
    images: string[];
    alt: string;
}

export function VehicleGallery({ images, alt }: VehicleGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const total = images.length;
    const selectedImage = images[selectedIndex];

    const openLightbox = () => {
        setLightboxIndex(selectedIndex);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => setIsLightboxOpen(false);

    const nextImageLightbox = useCallback(() => {
        setLightboxIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prevImageLightbox = useCallback(() => {
        setLightboxIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const handleNextMain = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % total);
    };

    const handlePrevMain = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + total) % total);
    };

    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImageLightbox();
            if (e.key === 'ArrowLeft') prevImageLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, nextImageLightbox, prevImageLightbox]);

    return (
        <div className="lg:col-span-2 space-y-4">
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="size-8" />
                    </button>

                    {total > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImageLightbox(); }}
                            className="absolute left-4 text-white/70 hover:text-white p-2 transition-colors z-50 hidden sm:block"
                            aria-label="Imagem anterior"
                        >
                            <ChevronLeft className="size-10" />
                        </button>
                    )}

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                        <Image
                            src={images[lightboxIndex]}
                            alt={`${alt} - imagem ${lightboxIndex + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                        />

                        {total > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                                {lightboxIndex + 1} / {total}
                            </div>
                        )}
                    </div>

                    {total > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImageLightbox(); }}
                            className="absolute right-4 text-white/70 hover:text-white p-2 transition-colors z-50 hidden sm:block"
                            aria-label="Imagem seguinte"
                        >
                            <ChevronRight className="size-10" />
                        </button>
                    )}
                </div>
            )}

            <div
                className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 border cursor-zoom-in group"
                onClick={openLightbox}
            >
                <Image
                    src={selectedImage}
                    alt={alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                        Ver Ecrã Inteiro
                    </div>
                </div>

                {total > 1 && (
                    <>
                        <button
                            onClick={handlePrevMain}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Imagem anterior"
                        >
                            <ChevronLeft className="size-6" />
                        </button>
                        <button
                            onClick={handleNextMain}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Imagem seguinte"
                        >
                            <ChevronRight className="size-6" />
                        </button>
                    </>
                )}
            </div>

            {total > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                    {images.map((src, index) => (
                        <button
                            key={src}
                            type="button"
                            className={`relative aspect-video rounded-md overflow-hidden border cursor-pointer transition-all hover:opacity-100 ${index === selectedIndex ? 'border-red-600 ring-2 ring-red-100' : 'border-border/50 opacity-70'}`}
                            onClick={() => setSelectedIndex(index)}
                            aria-label={`Ver imagem ${index + 1}`}
                        >
                            <Image
                                src={src}
                                alt={`${alt} - miniatura ${index + 1}`}
                                fill
                                sizes="(max-width: 640px) 25vw, 15vw"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
