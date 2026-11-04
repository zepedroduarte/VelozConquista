// Cartão de viatura (inspirado no Standvirtual): foto, preço em destaque e os 4 dados
// que mais pesam na decisão — ano, quilómetros, combustível e caixa.
import Link from "next/link";
import { Calendar, Camera, Fuel, Gauge, Settings2 } from "lucide-react";
import { VehiclePhoto } from "@/components/app/VehiclePhoto";
import { Vehicle } from "@/lib/types";
import { formatMileage, formatPrice, getPrimaryImageUrl, vehicleHref } from "@/lib/vehicle";

interface VehicleCardProps {
    vehicle: Vehicle;
    priority?: boolean;
    sizes?: string;
}

export function VehicleCard({ vehicle, priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" }: VehicleCardProps) {
    const details = vehicle.vehicle_data;
    const imageUrl = getPrimaryImageUrl(vehicle);
    const photoCount = details.images?.length ?? 0;
    const available = !vehicle.status || vehicle.status.name === "Disponível";

    const specs = [
        { icon: Calendar, text: details.year },
        { icon: Gauge, text: formatMileage(details.mileage) },
        { icon: Fuel, text: details.fuel_type?.name },
        { icon: Settings2, text: details.transmission_type?.name },
    ].filter((s) => s.text);

    return (
        <Link
            href={vehicleHref(vehicle)}
            className="group flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-red-600"
        >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100">
                <VehiclePhoto
                    src={imageUrl}
                    alt={`${details.make} ${details.model} ${details.year}`}
                    fill
                    sizes={sizes}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={priority}
                    unoptimized={imageUrl.includes("127.0.0.1")}
                />
                {!available && (
                    <span className="absolute left-2 top-2 rounded-md bg-neutral-900/85 px-2 py-1 text-xs font-semibold text-white">
                        {vehicle.status.name}
                    </span>
                )}
                {photoCount > 1 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white">
                        <Camera className="size-3.5" aria-hidden /> {photoCount}
                        <span className="sr-only">fotos</span>
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground group-hover:text-red-600">
                        {details.make} {details.model}
                    </h3>
                    {details.version && (
                        <p className="truncate text-sm text-muted-foreground">{details.version}</p>
                    )}
                </div>

                <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-foreground/80">
                    {specs.map(({ icon: Icon, text }) => (
                        <li key={String(text)} className="flex min-w-0 items-center gap-1.5">
                            <Icon className="size-4 shrink-0 text-neutral-400" aria-hidden />
                            <span className="truncate">{text}</span>
                        </li>
                    ))}
                </ul>

                <p className="mt-auto text-2xl font-bold tracking-tight text-foreground">
                    {formatPrice(vehicle.retail_price)}
                </p>
            </div>
        </Link>
    );
}
