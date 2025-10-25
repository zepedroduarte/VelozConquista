// fe/src/components/app/VehicleCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Fuel, Gauge, Car } from "lucide-react";

interface VehicleData {
    id: number;
    make: string;
    model: string;
    year: number;
    mileage: number;
    transmission: string;
    fuel: string;
    engineSize: number;
    price: number;
    imageSrc: string;
}

interface VehicleCardProps {
    vehicle: VehicleData;
}

function formatPrice(price: number): string {
    return price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    
    return (
        <Card className="overflow-hidden shadow-md transition-shadow hover:shadow-lg flex flex-col h-full">
            
            <div className="relative w-full h-40 shrink-0">
                <Image
                    src={vehicle.imageSrc}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="p-4 space-y-3 flex flex-col flex-1">
                <CardHeader className="p-0 space-y-1">
                    <CardTitle className="text-lg font-bold">
                        {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {vehicle.year} | {vehicle.mileage.toLocaleString()} km
                    </p>
                </CardHeader>

                <CardContent className="p-0 text-sm text-foreground/80 grid grid-cols-2 gap-y-1">
                    <div className="flex items-center gap-2">
                        <Fuel className="size-3 text-primary shrink-0" />
                        <span className="text-xs">{vehicle.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-3 text-primary shrink-0" />
                        <span className="text-xs">{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gauge className="size-3 text-primary shrink-0" />
                        <span className="text-xs">{vehicle.engineSize}L</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Car className="size-3 text-primary shrink-0" />
                        <span className="text-xs">4 Portas</span>
                    </div>
                </CardContent>

                <div className="flex justify-between items-center pt-3 border-t border-border/50 mt-auto">
                    <div className="text-xl font-extrabold text-foreground">
                        {formatPrice(vehicle.price)}
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