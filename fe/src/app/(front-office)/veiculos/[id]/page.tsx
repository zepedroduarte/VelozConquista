// fe/src/app/veiculos/[id]/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Fuel, Gauge, Car, Zap, DoorOpen, Users, Palette, Calendar, Ruler, SlidersHorizontal } from "lucide-react";
import { DetailItem } from "@/components/app/DetailItem";

interface VehicleDetail {
    id: string;
    make: string;
    model: string;
    version: string;
    year: number;
    description: string;
    mileage: number;
    transmission: string;
    fuel: string;
    engineSize: number; 
    power: number; 
    color: string;
    seats: number;
    doors: number;
    bodyStyle: string;
    retailPrice: number;
    mainImage: string;
    galleryImages: string[];
}

const MOCK_VEHICLE_DETAILS: VehicleDetail = {
    id: "1",
    make: "Mercedes-Benz",
    model: "Classe C",
    version: "C 220d AMG Line",
    year: 2023,
    description: "Viatura de luxo semi-nova, com histórico de manutenção completo na marca. Excelente estado interior e exterior. Equipado com pack AMG, ideal para quem procura performance e elegância.",
    mileage: 2500,
    transmission: "Automática",
    fuel: "Diesel",
    engineSize: 1950, 
    power: 194, 
    color: "Preto Obsidiana",
    seats: 5,
    doors: 4,
    bodyStyle: "Sedan",
    retailPrice: 59990.00,
    mainImage: "/placeholder.svg?height=800&width=1200&text=Mercedes+C+220d",
    galleryImages: [
        "/placeholder.svg?height=200&width=300&text=Foto+2",
        "/placeholder.svg?height=200&width=300&text=Foto+3",
        "/placeholder.svg?height=200&width=300&text=Foto+4",
    ]
};

function formatPrice(price: number): string {
    return price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}
function formatMileage(miles: number): string {
    return miles.toLocaleString('pt-PT') + ' km';
}
function formatEngineSize(cc: number): string {
    return (cc / 1000).toFixed(1) + 'L / ' + cc + 'cc';
}

interface VehicleDetailsProps {
    params: Promise<{ id: string }> | { id: string };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsProps) {
    
    const unwrappedParams = await Promise.resolve(params); 
    const vehicleId = unwrappedParams.id; 

    const vehicle = MOCK_VEHICLE_DETAILS;


    return (
        <main className="flex-1 py-16">
            <div className="w-[70vw] mx-auto space-y-10">
                <div className="flex flex-col gap-2">
                    <Link href="/veiculos" passHref>
                        <Button variant="link" className="w-fit p-0 gap-1 text-primary hover:text-primary/80">
                            <ChevronLeft className="size-4" /> Voltar ao Inventário
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight">
                        {vehicle.make} {vehicle.model}
                    </h1>
                    <p className="text-2xl font-semibold text-muted-foreground">{vehicle.version}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                            <Image 
                                src={vehicle.mainImage} 
                                alt={`${vehicle.make} ${vehicle.model} principal`} 
                                fill 
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {vehicle.galleryImages.map((src, index) => (
                                <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-border/50 cursor-pointer hover:border-primary transition-colors">
                                    <Image src={src} alt={`Galeria ${index + 2}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-20 shadow-xl bg-card">
                            <CardTitle className="text-3xl font-extrabold text-foreground border-b pb-4 mb-4">
                                {formatPrice(vehicle.retailPrice)}
                            </CardTitle>
                            <div className="space-y-4">
                                <p className="text-lg text-muted-foreground">
                                    Interessado neste veículo? Contacte-nos para um teste drive ou proposta.
                                </p>
                                <Link href="/contacto" passHref>
                                    <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white">
                                        Fale Conosco
                                    </Button>
                                </Link>
                                <p className="text-xs text-center text-muted-foreground pt-2">
                                    Disponível para financiamento.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl font-bold border-b pb-2 text-foreground">Descrição</h2>
                    <p className="text-lg text-foreground/90 leading-relaxed">{vehicle.description}</p>

                    <Separator />
                    
                    <h2 className="text-3xl font-bold border-b pb-2 text-foreground">Especificações</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-foreground/90">
                        
                        <DetailItem icon={Calendar} label="Ano" value={vehicle.year} />
                        <DetailItem icon={Gauge} label="Quilometragem" value={formatMileage(vehicle.mileage)} />
                        <DetailItem icon={Zap} label="Potência" value={`${vehicle.power} cv`} />

                        <DetailItem icon={Fuel} label="Combustível" value={vehicle.fuel} />
                        <DetailItem icon={SlidersHorizontal} label="Transmissão" value={vehicle.transmission} />
                        <DetailItem icon={Ruler} label="Cilindrada" value={formatEngineSize(vehicle.engineSize)} />

                        <DetailItem icon={Palette} label="Cor Exterior" value={vehicle.color} />
                        <DetailItem icon={Users} label="Lugares" value={vehicle.seats} />
                        <DetailItem icon={DoorOpen} label="Portas" value={vehicle.doors} />
                        
                        <DetailItem icon={Car} label="Tipo Carroçaria" value={vehicle.bodyStyle} />
                    </div>
                </div>

            </div>
        </main>
    );
}