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

// Separador de milhares sempre presente ("9 900 €"): o pt-PT do browser não separa números de 4 dígitos.
const NBSP = "\u00a0";

function groupThousands(value: number, decimals = 0): string {
    const [int, dec] = value.toFixed(decimals).split(".");
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + (dec ? `,${dec}` : "");
}

export function formatPrice(price: string | number, minimumFractionDigits = 0): string {
    return `${groupThousands(Number(price), minimumFractionDigits)}${NBSP}€`;
}

export function formatMileage(km: string | number): string {
    return `${groupThousands(Number(km))}${NBSP}km`;
}

/** "1 598 cm³", ou null quando não há cilindrada (elétricos ou campo por preencher). */
export function formatEngineSize(cc: string | number): string | null {
    const value = Number(cc);
    return value > 0 ? `${groupThousands(value)}${NBSP}cm³` : null;
}

/** "90 cv", ou null quando a potência não está preenchida. */
export function formatPower(cv: string | number): string | null {
    const value = Number(cv);
    return value > 0 ? `${value.toFixed(0)}${NBSP}cv` : null;
}

export function slugify(text: string): string {
    return text
        .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Siglas que ficam sempre em maiúsculas (marcas, motores, versões)
const ACRONYMS = new Set([
    "VW", "BMW", "MG", "DS",
    "TDI", "TSI", "TFSI", "FSI", "GTI", "GTD", "HDI", "TDCI", "CDTI", "CDI", "CRDI", "DCI", "JTD", "JTDM", "VTI", "THP", "TCE", "SDI", "D4D", "GPL", "LPG",
    "AMG", "GT", "GTS", "RS", "ST", "SW", "SUV", "CC", "ML", "GL", "GLA", "GLB", "GLC", "GLE", "CLA", "CLS", "SLK", "SL", "AWD", "4WD", "FWD", "RWD",
    "II", "III", "IV",
]);
// Grafias próprias das marcas
const SPECIAL: Record<string, string> = {
    CITROEN: "Citroën", BLUEHDI: "BlueHDi", PURETECH: "PureTech", ECOFLEX: "ecoFLEX", XDRIVE: "xDrive",
    SKODA: "Škoda", ALFA: "Alfa", "MERCEDES-BENZ": "Mercedes-Benz",
};

function formatWord(word: string): string {
    const upper = word.toUpperCase();
    if (SPECIAL[upper]) return SPECIAL[upper];
    if (ACRONYMS.has(upper) || /\d/.test(word)) return upper;      // "TDI", "B150", "2.0", "CX5"
    if (word.includes("-")) return word.split("-").map(formatWord).join("-"); // "Skyactiv-G"
    if (upper.length === 1) return upper;
    return upper[0] + upper.slice(1).toLowerCase();
}

/**
 * Escrita uniforme de marca, modelo e versão, independentemente de como foram escritos no admin:
 * "FIAT DOBLO MULTIJET" / "fiat doblo multijet" → "Fiat Doblo Multijet"; siglas e códigos ficam
 * em maiúsculas ("VW Passat CC 2.0 TDI", "Mercedes B150").
 */
export function formatVehicleName(text?: string | null): string {
    return (text ?? "").trim().split(/\s+/).filter(Boolean).map(formatWord).join(" ");
}

/** Devolve a viatura com marca, modelo e versão já uniformizados (usado ao carregar os dados). */
export function withFormattedNames(vehicle: Vehicle): Vehicle {
    const data = vehicle.vehicle_data;
    return {
        ...vehicle,
        vehicle_data: {
            ...data,
            make: formatVehicleName(data.make),
            model: formatVehicleName(data.model),
            version: formatVehicleName(data.version),
        },
    };
}

/** Segmento do URL: "20-fiat-doblo-multijet-1-3-2016" (o número é o que conta). */
export function vehicleSlug(vehicle: Vehicle): string {
    const { make, model, version, year } = vehicle.vehicle_data;
    return [vehicle.id, slugify([make, model, version, year].filter(Boolean).join(" "))].filter(Boolean).join("-").slice(0, 90).replace(/-+$/, "");
}

export function vehicleHref(vehicle: Vehicle): string {
    return `/veiculos/${vehicleSlug(vehicle)}`;
}

/** Aceita "20" ou "20-fiat-doblo-..." e devolve "20". */
export function vehicleIdFromSlug(slug: string): string | null {
    const match = /^(\d+)(?:-|$)/.exec(slug);
    return match ? match[1] : null;
}

export function vehicleTitle(vehicle: Vehicle): string {
    const { make, model, version } = vehicle.vehicle_data;
    return [make, model, version].filter(Boolean).join(" ");
}
