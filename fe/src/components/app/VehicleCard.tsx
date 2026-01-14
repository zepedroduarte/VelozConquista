// fe/src/components/app/VehicleCard.tsx (Componente Único e Reutilizável)

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Fuel, Gauge, Car } from "lucide-react";
import { APIVehicleData } from "@/lib/types";


interface Vehicle {
    id: number;
    retail_price: string; 
    status: { id: number, name: string };
    vehicle_data: APIVehicleData; 
    created_at?: string;
}

interface VehicleCardProps {
    vehicle: Vehicle; 
}

function formatPrice(price: string | number): string {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    
    const details = vehicle.vehicle_data;

    let imageUrl = "/teste.png"; 
    if (details.images && details.images.length > 0) {
        imageUrl = details.images[0].image;
        if (imageUrl.startsWith('/media')) {
            imageUrl = `http://127.0.0.1:8000${imageUrl}`;
        }
    }

    const engineLiter = details.engine_size ? (parseFloat(details.engine_size) / 1000).toFixed(1) : "0.0";

    return (
        <Card className="overflow-hidden shadow-md transition-shadow hover:shadow-lg flex flex-col h-full p-0 bg-white border-border/50">
    
            <div className={`relative w-full h-48 shrink-0 bg-gray-100`}>
                <Image
                    src={imageUrl}
                    alt={`${details.make} ${details.model}`}
                    fill
                    className="object-cover"
                    unoptimized={imageUrl.includes("127.0.0.1")} 
                />
            </div>

            <div className="p-4 pt-0 space-y-3 flex flex-col flex-1">
                <CardHeader className="p-0 space-y-1">
                    <CardTitle className="text-lg font-bold line-clamp-1">
                        {details.make} {details.model}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {details.year} | {Number(details.mileage).toLocaleString('pt-PT')} km
                    </p>
                </CardHeader>

                <CardContent className="p-0 text-sm text-foreground/80 grid grid-cols-2 gap-y-2 gap-x-1">
                    <div className="flex items-center gap-2">
                        <Fuel className="size-3 text-red-600 shrink-0" />
                        <span className="text-xs truncate">{details.fuel_type?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-3 text-red-600 shrink-0" />
                        <span className="text-xs truncate">{details.transmission_type?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gauge className="size-3 text-red-600 shrink-0" />
                        <span className="text-xs">{engineLiter}L ({Number(details.power).toFixed(0)}cv)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Car className="size-3 text-red-600 shrink-0" />
                        <span className="text-xs">{details.doors} Portas</span>
                    </div>
                </CardContent>

                <div className="flex justify-between items-center pt-3 border-t border-border/50 mt-auto">
                    <div className="text-xl font-bold text-gray-900">
                        {formatPrice(vehicle.retail_price)}
                    </div>
                    <Link href={`/veiculos/${vehicle.id}`} passHref>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1">
                            Ver Detalhes
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}