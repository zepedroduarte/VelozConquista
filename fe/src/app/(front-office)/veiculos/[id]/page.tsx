import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    ChevronLeft, Fuel, Gauge, Car, Zap, DoorOpen, Users,
    Palette, Calendar, Ruler, SlidersHorizontal
} from "lucide-react";
import { DetailItem } from "@/components/app/DetailItem";
import { VehicleGallery } from "@/components/app/VehicleGallery";
import { getAllVehicles, getVehicle } from "@/lib/api-server";
import {
    formatEngineSize, formatMileage, formatPrice, getImageUrl,
    getPrimaryImageUrl, PLACEHOLDER_IMAGE, vehicleTitle
} from "@/lib/vehicle";

interface VehicleDetailsProps {
    params: Promise<{ id: string }>;
}

// Pré-gera todas as viaturas no build; viaturas novas são geradas no primeiro acesso.
export async function generateStaticParams() {
    try {
        const vehicles = await getAllVehicles();
        return vehicles.map((v) => ({ id: String(v.id) }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: VehicleDetailsProps): Promise<Metadata> {
    const { id } = await params;
    const vehicle = await getVehicle(id);
    if (!vehicle) return { title: "Veículo não encontrado | Veloz Conquista" };

    const details = vehicle.vehicle_data;
    const title = `${vehicleTitle(vehicle)} ${details.year} | Veloz Conquista`;
    const description = `${details.make} ${details.model} de ${details.year}, ${formatMileage(details.mileage)}, ${details.fuel_type.name}, ${details.transmission_type.name}. ${formatPrice(vehicle.retail_price)}. Financiamento até 120 meses.`;
    const image = getPrimaryImageUrl(vehicle);

    return {
        title,
        description,
        alternates: { canonical: `/veiculos/${vehicle.id}` },
        openGraph: {
            title,
            description,
            images: image !== PLACEHOLDER_IMAGE ? [image] : undefined,
        },
    };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsProps) {
    const { id } = await params;
    const vehicle = await getVehicle(id);

    if (!vehicle) notFound();

    const details = vehicle.vehicle_data;

    // Imagem principal primeiro
    const sortedImages = [...(details.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    const galleryUrls = sortedImages.length > 0
        ? sortedImages.map((img) => getImageUrl(img.image))
        : [PLACEHOLDER_IMAGE];

    return (
        <main className="flex-1 py-16 bg-white">
            <div className="w-[70vw] mx-auto space-y-10">

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

                    <VehicleGallery images={galleryUrls} alt={`${details.make} ${details.model} ${details.year}`} />

                    <div className="lg:col-span-1">
                        <Card className="p-6 top-24 shadow-xl bg-white border-border/50">
                            <CardTitle className="text-3xl text-foreground border-b pb-4 flex justify-between items-center">
                                <span className="font-extrabold">{formatPrice(vehicle.retail_price, 2)}</span>
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
