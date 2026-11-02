// fe/src/components/app/VehicleCard.tsx (Componente Único e Reutilizável)

import Link from "next/link";
import { VehiclePhoto } from "@/components/app/VehiclePhoto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Fuel, Gauge, Car } from "lucide-react";
import { Vehicle } from "@/lib/types";
import { formatPrice, getPrimaryImageUrl } from "@/lib/vehicle";

interface VehicleCardProps {
    vehicle: Vehicle; 
    priority?: boolean;
}

export function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
    
    const details = vehicle.vehicle_data;

    const imageUrl = getPrimaryImageUrl(vehicle);

    const engineLiter = details.engine_size ? (parseFloat(details.engine_size) / 1000).toFixed(1) : "0.0";

    return (
        <Link href={`/veiculos/${vehicle.id}`} className="block h-full">
        <Card className="overflow-hidden shadow-md transition-all hover:shadow-xl cursor-pointer flex flex-col h-full p-0 bg-white border-border/50 group">
    
            <div className="relative w-full aspect-[4/3] shrink-0 bg-gray-100 overflow-hidden">
                <VehiclePhoto
                    src={imageUrl}
                    alt={`${details.make} ${details.model}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={priority}
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

                <div className="pt-3 border-t border-border/50 mt-auto">
                    <div className="text-xl font-bold text-gray-900">
                        {formatPrice(vehicle.retail_price)}
                    </div>
                </div>
            </div>
        </Card>
        </Link>
    );
}