'use client'

import { VehiclePhoto } from "@/components/app/VehiclePhoto";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Só as primeiras miniaturas são descarregadas (a última mostra "+N" e abre o ecrã inteiro).
// No telemóvel não há miniaturas: desliza-se a foto principal, para não atrasar o carregamento.
const MAX_THUMBS = 10;

/** Deslizar o dedo para a esquerda/direita. */
function swipe(onNext: () => void, onPrev: () => void) {
    let startX: number | null = null;
    return {
        onTouchStart: (e: React.TouchEvent) => { startX = e.touches[0].clientX; },
        onTouchEnd: (e: React.TouchEvent) => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            startX = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) onNext(); else onPrev();
        },
    };
}

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
        <div className="space-y-3">
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
                            className="absolute left-1 sm:left-4 text-white/70 hover:text-white p-2 transition-colors z-50"
                            aria-label="Imagem anterior"
                        >
                            <ChevronLeft className="size-10" />
                        </button>
                    )}

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]" {...swipe(nextImageLightbox, prevImageLightbox)}>
                        <VehiclePhoto
                            src={images[lightboxIndex]}
                            fullFrame
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
                            className="absolute right-1 sm:right-4 text-white/70 hover:text-white p-2 transition-colors z-50"
                            aria-label="Imagem seguinte"
                        >
                            <ChevronRight className="size-10" />
                        </button>
                    )}
                </div>
            )}

            <div
                className="relative -mx-4 aspect-[4/3] cursor-zoom-in overflow-hidden bg-neutral-100 group sm:mx-0 sm:rounded-xl"
                onClick={openLightbox}
                {...swipe(() => setSelectedIndex((prev) => (prev + 1) % total), () => setSelectedIndex((prev) => (prev - 1 + total) % total))}
            >
                <VehiclePhoto
                    src={selectedImage}
                    alt={alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 840px"
                    className="object-cover"
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Imagem anterior"
                        >
                            <ChevronLeft className="size-6" />
                        </button>
                        <button
                            onClick={handleNextMain}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Imagem seguinte"
                        >
                            <ChevronRight className="size-6" />
                        </button>
                        <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white pointer-events-none">
                            {selectedIndex + 1} / {total}
                        </span>
                    </>
                )}
            </div>

            {total > 1 && (
                <div className="hidden sm:grid grid-cols-5 gap-2">
                    {images.slice(0, MAX_THUMBS).map((src, index) => (
                        <button
                            key={src}
                            type="button"
                            className={`relative aspect-[4/3] rounded-md overflow-hidden border cursor-pointer transition-all hover:opacity-100 ${index === selectedIndex ? 'border-red-600 ring-2 ring-red-100' : 'border-border/50 opacity-70'}`}
                            onClick={() => setSelectedIndex(index)}
                            aria-label={`Ver imagem ${index + 1}`}
                        >
                            <VehiclePhoto
                                src={src}
                                alt={`${alt} - miniatura ${index + 1}`}
                                fill
                                sizes="(max-width: 640px) 25vw, 15vw"
                                className="object-cover"
                            />
                            {index === MAX_THUMBS - 1 && total > MAX_THUMBS && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white font-semibold"
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); setIsLightboxOpen(true); }}>
                                    +{total - MAX_THUMBS + 1}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
