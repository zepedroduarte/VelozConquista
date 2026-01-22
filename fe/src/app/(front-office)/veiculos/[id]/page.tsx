'use client'

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { 
    ChevronLeft, Fuel, Gauge, Car, Zap, DoorOpen, Users, 
    Palette, Calendar, Ruler, SlidersHorizontal, Loader2, 
    X, ChevronRight
} from "lucide-react";
import { DetailItem } from "@/components/app/DetailItem"; 
import { useEffect, useState, use, useCallback } from "react";
import api from "@/lib/axios";
import { APIVehicleData } from "@/lib/types"; 

export interface Vehicle {
    id: number;
    retail_price: string;
    status: { id: number, name: string };
    vehicle_data: APIVehicleData;
    created_at?: string;
}

function formatPrice(price: string | number): string {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}

function formatMileage(miles: string | number): string {
    return Number(miles).toLocaleString('pt-PT') + ' km';
}

function formatEngineSize(cc: string | number): string {
    const num = Number(cc);
    return num.toFixed(0) + 'cc';
}

const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.svg";
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path}`;
};

interface VehicleDetailsProps {
    params: Promise<{ id: string }>;
}

export default function VehicleDetailsPage({ params }: VehicleDetailsProps) {
    const { id } = use(params);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedImage, setSelectedImage] = useState<string>(""); 
    const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
    const [currentImageIndex, setCurrentImageIndex] = useState(0); 

    useEffect(() => {
        async function fetchVehicle() {
            try {
                const response = await api.get(`/vehicles/${id}/`);
                setVehicle(response.data);

                console.log("Vehicle data:", response.data.vehicle_data.images);
                
                const images = response.data.vehicle_data.images;
                if (images && images.length > 0) {
                    setSelectedImage(getImageUrl(images[0].image));
                } else {
                    setSelectedImage("/teste.png"); 
                }
            } catch (error) {
                console.error("Erro ao carregar veículo:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchVehicle();
    }, [id]);

    const rawImages = vehicle?.vehicle_data.images || [];

    const galleryUrls = rawImages.length > 0 
        ? rawImages.map(img => getImageUrl(img.image)) 
        : ["/teste.png"]; 

    const openLightbox = () => {
        const index = galleryUrls.indexOf(selectedImage);
        setCurrentImageIndex(index !== -1 ? index : 0);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => setIsLightboxOpen(false);

    const nextImageLightbox = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryUrls.length);
    }, [galleryUrls.length]);

    const prevImageLightbox = useCallback(() => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryUrls.length) % galleryUrls.length);
    }, [galleryUrls.length]);

    const handleNextMain = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const currentIndex = galleryUrls.indexOf(selectedImage);
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = (safeIndex + 1) % galleryUrls.length;
        setSelectedImage(galleryUrls[nextIndex]);
    };

    const handlePrevMain = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const currentIndex = galleryUrls.indexOf(selectedImage);
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        const prevIndex = (safeIndex - 1 + galleryUrls.length) % galleryUrls.length;
        setSelectedImage(galleryUrls[prevIndex]);
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


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h1 className="text-2xl font-bold">Veículo não encontrado</h1>
                <Link href="/veiculos"><Button>Voltar ao Inventário</Button></Link>
            </div>
        );
    }

    const details = vehicle.vehicle_data;

    return (
        <main className="flex-1 py-16 bg-white">
            <div className="w-[70vw] mx-auto space-y-10">
                
                {isLightboxOpen && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
                        <button 
                            onClick={closeLightbox} 
                            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 transition-colors"
                        >
                            <X className="size-8" />
                        </button>

                        {galleryUrls.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevImageLightbox(); }}
                                className="absolute left-4 text-white/70 hover:text-white p-2 transition-colors z-50 hidden sm:block"
                            >
                                <ChevronLeft className="size-10" />
                            </button>
                        )}

                        <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                            <Image 
                                src={galleryUrls[currentImageIndex]} 
                                alt="Imagem em detalhe" 
                                fill 
                                className="object-contain"
                                unoptimized={galleryUrls[currentImageIndex]?.includes("127.0.0.1")}
                            />

                            {galleryUrls.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                                    {currentImageIndex + 1} / {galleryUrls.length}
                                </div>
                            )}
                        </div>

                        {galleryUrls.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextImageLightbox(); }}
                                className="absolute right-4 text-white/70 hover:text-white p-2 transition-colors z-50 hidden sm:block"
                            >
                                <ChevronRight className="size-10" />
                            </button>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Link className="w-fit" href="/veiculos" passHref>
                        <Button variant="link" className="w-fit p-0 gap-1 text-primary hover:text-red-600">
                            <ChevronLeft className="size-4" /> Voltar ao Inventário
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        {details.make} {details.model}
                    </h1>
                    <p className="text-2xl font-semibold text-muted-foreground">
                        {details.version}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-4">
                        <div 
                            className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 border cursor-zoom-in group"
                            onClick={openLightbox}
                        >
                            <Image 
                                src={selectedImage} 
                                alt={`${details.make} principal`} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                                unoptimized={selectedImage.includes("127.0.0.1")}
                            />
                            
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                <div className="bg-black/50 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                    Ver Ecrã Inteiro
                                </div>
                            </div>

                            {galleryUrls.length > 1 && (
                                <>
                                    <button 
                                        onClick={handlePrevMain}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="size-6" />
                                    </button>
                                    <button 
                                        onClick={handleNextMain}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-md z-10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="size-6" />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {details.images && details.images.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                {details.images.map((img) => {
                                    const src = getImageUrl(img.image);
                                    return (
                                        <div 
                                            key={img.id} 
                                            className={`relative aspect-video rounded-md overflow-hidden border cursor-pointer transition-all hover:opacity-100 ${selectedImage === src ? 'border-red-600 ring-2 ring-red-100' : 'border-border/50 opacity-70'}`}
                                            onClick={() => setSelectedImage(src)}
                                        >
                                            <Image 
                                                src={src} 
                                                alt={`Galeria`} 
                                                fill 
                                                className="object-cover"
                                                unoptimized={src.includes("127.0.0.1")}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-6 top-24 shadow-xl bg-white border-border/50">
                            <CardTitle className="text-3xl text-foreground border-b pb-4 flex justify-between items-center">
                                <span className="font-extrabold">{formatPrice(vehicle.retail_price)}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${vehicle.status.name === 'Disponível' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {vehicle.status.name}
                                </span>
                            </CardTitle>
                            
                            <div className="space-y-6">
                                
                                <div className="space-y-3">
                                    <Link href="/contacto" passHref>
                                        <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                                            Pedir Informações
                                        </Button>
                                    </Link>
                                </div>
                                
                                <p className="text-xs text-center text-muted-foreground pt-2">
                                    Disponível para financiamento até 120 meses.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold border-b pb-2 text-foreground">Especificações Técnicas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-8 text-foreground/90">
                            <DetailItem icon={Calendar} label="Ano" value={details.year} />
                            <DetailItem icon={Gauge} label="Quilometragem" value={formatMileage(details.mileage)} />
                            <DetailItem icon={Zap} label="Potência" value={`${Number(details.power).toFixed(0)} cv`} />
                            <DetailItem icon={Fuel} label="Combustível" value={details.fuel_type.name} />
                            <DetailItem icon={SlidersHorizontal} label="Transmissão" value={details.transmission_type.name} />
                            <DetailItem icon={Ruler} label="Cilindrada" value={formatEngineSize(details.engine_size)} />
                            <DetailItem icon={Palette} label="Cor" value={details.color || "N/A"} />
                            <DetailItem icon={Users} label="Lugares" value={details.seats} />
                            <DetailItem icon={DoorOpen} label="Portas" value={details.doors} />
                            {details.body_style && (
                                <DetailItem icon={Car} label="Carroçaria" value={details.body_style.name} />
                            )}
                            {details.traction_type && (
                                <DetailItem icon={Car} label="Tração" value={details.traction_type.name} />
                            )}
                        </div>
                    </div>                               
                </div>

            </div>
        </main>
    );
}