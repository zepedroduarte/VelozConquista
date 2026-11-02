import { Vehicle } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const PLACEHOLDER_IMAGE = "/teste.png";

export function getImageUrl(path?: string | null): string {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
}

export function getPrimaryImageUrl(vehicle: Vehicle): string {
    const images = vehicle.vehicle_data.images ?? [];
    const primary = images.find((img) => img.is_primary) || images[0];
    return getImageUrl(primary?.image);
}

export function formatPrice(price: string | number, minimumFractionDigits = 0): string {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return numericPrice.toLocaleString("pt-PT", { style: "currency", currency: "EUR", minimumFractionDigits });
}

export function formatMileage(km: string | number): string {
    return Number(km).toLocaleString("pt-PT") + " km";
}

export function formatEngineSize(cc: string | number): string {
    return Number(cc).toFixed(0) + "cc";
}

export function vehicleTitle(vehicle: Vehicle): string {
    const { make, model, version } = vehicle.vehicle_data;
    return [make, model, version].filter(Boolean).join(" ");
}
