// Dados estruturados (schema.org / JSON-LD) e textos de SEO local.
// O Google usa-os no "pack" local e nos resultados de viaturas; o ChatGPT, Gemini e
// Perplexity usam-nos para perceber quem somos, onde estamos e o que vendemos.
import { CompanySettings, Vehicle } from "./types";
import { SITE_URL } from "./site";
import { getImageUrl, vehicleHref, vehicleTitle } from "./vehicle";

export const DEFAULT_LOCALITY = "Loures";

export const toLines = (text?: string) => (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

/** "09:00-13:00, 14:30-19:00" → [["09:00","13:00"], ["14:30","19:00"]] */
export function parseHours(value?: string): [string, string][] {
    if (!value) return [];
    return value.split(",").map((range) => {
        const [opens, closes] = range.split("-").map((t) => t.trim().padStart(5, "0"));
        return [opens, closes] as [string, string];
    }).filter(([o, c]) => /^\d{2}:\d{2}$/.test(o) && /^\d{2}:\d{2}$/.test(c));
}

const HOURS_DAYS = [
    { key: "weekday_hours", label: "Segunda a sexta", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    { key: "saturday_hours", label: "Sábado", days: ["Saturday"] },
    { key: "sunday_hours", label: "Domingo", days: ["Sunday"] },
] as const;

/** Para mostrar no site: [{label: "Segunda a sexta", text: "9h – 19h"}, ...] */
// Horário anterior, usado só enquanto o backend ainda não tem os campos (durante um deploy)
const FALLBACK_HOURS = { weekday_hours: "09:00-19:00", saturday_hours: "10:00-16:00", sunday_hours: "" };

export function openingHoursRows(company: CompanySettings | null) {
    const pretty = (t: string) => t.replace(/^0/, "").replace(":00", "h").replace(":", "h");
    const source = company?.weekday_hours === undefined ? FALLBACK_HOURS : company;
    return HOURS_DAYS.map(({ key, label }) => {
        const ranges = parseHours(source?.[key]);
        return { label, text: ranges.length ? ranges.map(([o, c]) => `${pretty(o)} – ${pretty(c)}`).join(", ") : "Fechado" };
    });
}

/** Morada sem o código postal e a localidade (que vão em campos próprios no schema). */
function streetAddress(company: CompanySettings): string {
    let street = company.address ?? "";
    if (company.postal_code) street = street.split(company.postal_code)[0];
    return street.replace(/[,\s]+$/, "");
}

export function autoDealerJsonLd(company: CompanySettings | null) {
    if (!company) return null;
    const sameAs = [company.instagram_url, company.facebook_url].filter(Boolean);
    const lat = Number(company.latitude), lng = Number(company.longitude);

    return {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "@id": `${SITE_URL}/#dealer`,
        name: company.name || "Veloz Conquista",
        description: company.description,
        url: SITE_URL,
        telephone: company.phone,
        email: company.email,
        image: company.logo || undefined,
        address: {
            "@type": "PostalAddress",
            streetAddress: streetAddress(company),
            postalCode: company.postal_code || undefined,
            addressLocality: company.locality || DEFAULT_LOCALITY,
            addressRegion: "Lisboa",
            addressCountry: "PT",
        },
        geo: Number.isFinite(lat) && Number.isFinite(lng) && company.latitude && company.longitude
            ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng }
            : undefined,
        hasMap: company.google_maps_url || undefined,
        openingHoursSpecification: HOURS_DAYS.flatMap(({ key, days }) =>
            parseHours(company[key]).map(([opens, closes]) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: days,
                opens,
                closes,
            })),
        ),
        areaServed: [
            { "@type": "Country", name: "Portugal" },
            ...toLines(company.service_areas).map((name) => ({ "@type": "City", name })),
        ],
        sameAs: sameAs.length ? sameAs : undefined,
        priceRange: "€€",
        currenciesAccepted: "EUR",
    };
}

export function carJsonLd(vehicle: Vehicle) {
    const d = vehicle.vehicle_data;
    const url = `${SITE_URL}${vehicleHref(vehicle)}`;
    const images = [...(d.images ?? [])]
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((img) => getImageUrl(img.image));

    return {
        "@context": "https://schema.org",
        "@type": "Car",
        "@id": `${url}#car`,
        name: vehicleTitle(vehicle),
        url,
        image: images.length ? images : undefined,
        brand: { "@type": "Brand", name: d.make },
        model: d.model,
        vehicleConfiguration: d.version || undefined,
        modelDate: String(d.year),
        itemCondition: "https://schema.org/UsedCondition",
        mileageFromOdometer: { "@type": "QuantitativeValue", value: Number(d.mileage), unitCode: "KMT" },
        fuelType: d.fuel_type?.name,
        vehicleTransmission: d.transmission_type?.name,
        bodyType: d.body_style?.name,
        driveWheelConfiguration: d.traction_type?.name,
        numberOfDoors: d.doors,
        seatingCapacity: d.seats,
        color: d.color || undefined,
        vehicleEngine: {
            "@type": "EngineSpecification",
            engineDisplacement: { "@type": "QuantitativeValue", value: Number(d.engine_size), unitCode: "CMQ" },
            enginePower: { "@type": "QuantitativeValue", value: Number(d.power), unitCode: "BHP" },
        },
        offers: {
            "@type": "Offer",
            price: Number(vehicle.retail_price),
            priceCurrency: "EUR",
            availability: vehicle.status?.name === "Disponível" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            itemCondition: "https://schema.org/UsedCondition",
            url,
            seller: { "@id": `${SITE_URL}/#dealer` },
        },
    };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
        })),
    };
}
