// Server-side data layer (ISR).
// Pages are rendered once, cached on the Vercel CDN and only regenerated when
// Django calls /api/revalidate (on-demand) or after REVALIDATE_SECONDS as a fallback.
// Visitors never wait for the Azure backend.
import "server-only";
import { CompanySettings, LegalInfo, Vehicle, VehicleOptions } from "./types";
import { withFormattedNames } from "./vehicle";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const REVALIDATE_SECONDS = 3600;

export const CACHE_TAGS = {
    vehicles: "vehicles",
    company: "company",
    attributes: "vehicle-attributes",
    legal: "legal",
} as const;

async function apiGet<T>(path: string, tags: string[]): Promise<T | null> {
    const res = await fetch(`${API_URL}/api${path}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS, tags },
    });

    if (res.status === 404) return null;

    // Throwing (instead of returning empty data) makes Next keep serving the
    // last good version of the page if the backend is down during a regeneration.
    if (!res.ok) throw new Error(`API ${path} respondeu ${res.status}`);

    return res.json() as Promise<T>;
}

interface Paginated<T> {
    count: number;
    next: string | null;
    results: T[];
}

/** All available vehicles (the public endpoint only returns "Disponível"). */
export async function getAllVehicles(): Promise<Vehicle[]> {
    const vehicles: Vehicle[] = [];

    for (let page = 1; page < 100; page++) {
        const data = await apiGet<Paginated<Vehicle> | Vehicle[]>(
            `/vehicles/?ordering=-created_at&page=${page}`,
            [CACHE_TAGS.vehicles],
        );
        if (!data) break;
        if (Array.isArray(data)) return data.map(withFormattedNames);

        vehicles.push(...data.results);
        if (!data.next) break;
    }

    return vehicles.map(withFormattedNames);
}

export async function getLatestVehicles(limit = 3): Promise<Vehicle[]> {
    const data = await apiGet<Paginated<Vehicle>>(`/vehicles/?ordering=-created_at`, [CACHE_TAGS.vehicles]);
    return (data?.results ?? []).slice(0, limit).map(withFormattedNames);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
    if (!/^\d+$/.test(id)) return null;
    const vehicle = await apiGet<Vehicle>(`/vehicles/${id}/`, [CACHE_TAGS.vehicles]);
    return vehicle && withFormattedNames(vehicle);
}

/** Página "Sobre": intermediário de crédito e apólice de seguro (editável no back-office). */
export async function getLegalInfo(): Promise<LegalInfo | null> {
    return apiGet<LegalInfo>(`/legal-info/`, [CACHE_TAGS.legal]);
}

/** Never throws: the layout falls back to client-side fetching if the backend is unreachable. */
export async function getCompany(): Promise<CompanySettings | null> {
    try {
        return await apiGet<CompanySettings>(`/company-settings/`, [CACHE_TAGS.company]);
    } catch (error) {
        console.error("Erro ao carregar definições da empresa:", error);
        return null;
    }
}

interface APIAttributes {
    body_style: VehicleOptions["bodyStyle"];
    fuel_type: VehicleOptions["fuelType"];
    transmission_type: VehicleOptions["transmissionType"];
    traction_type: VehicleOptions["tractionType"];
    status: VehicleOptions["status"];
}

/** Never throws: the layout falls back to client-side fetching if the backend is unreachable. */
export async function getVehicleOptions(): Promise<VehicleOptions | null> {
    try {
        const data = await apiGet<APIAttributes>(`/vehicle-attributes/`, [CACHE_TAGS.attributes]);
        if (!data) return null;
        return {
            bodyStyle: data.body_style,
            fuelType: data.fuel_type,
            transmissionType: data.transmission_type,
            tractionType: data.traction_type,
            status: data.status,
        };
    } catch (error) {
        console.error("Erro ao carregar opções de veículos:", error);
        return null;
    }
}
