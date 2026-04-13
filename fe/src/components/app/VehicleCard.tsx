import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, SlidersHorizontal, Car, ArrowRight } from "lucide-react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function formatPrice(price: string | number): string {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    const details = vehicle.vehicle_data;

    let imageUrl = "/teste.png";
    if (details.images && details.images.length > 0) {
        if (details.images[0].image.startsWith('http')) {
            imageUrl = details.images[0].image;
        } else {
            imageUrl = `${API_URL}${details.images[0].image}`;
        }
    }

    const engineLiter = details.engine_size
        ? (parseFloat(details.engine_size) / 1000).toFixed(1)
        : "0.0";

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Image */}
            <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={`${details.make} ${details.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={imageUrl.includes("127.0.0.1")}
                />
                {/* year badge */}
                <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {details.year}
                </span>
                {/* status badge */}
                {vehicle.status?.name && (
                    <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                        vehicle.status.name === "Disponível"
                            ? "bg-green-500/90 text-white"
                            : "bg-red-600/90 text-white"
                    }`}>
                        {vehicle.status.name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
                        {details.make} {details.model}
                    </h3>
                    {details.version && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{details.version}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Fuel className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{details.fuel_type?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{details.transmission_type?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Gauge className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span>{engineLiter}L · {Number(details.power).toFixed(0)} cv</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Car className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span>{Number(details.mileage).toLocaleString('pt-PT')} km</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Preço</p>
                        <p className="text-xl font-extrabold text-gray-900">
                            {formatPrice(vehicle.retail_price)}
                        </p>
                    </div>
                    <Link href={`/veiculos/${vehicle.id}`} passHref>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 transition-all">
                            Detalhes
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
