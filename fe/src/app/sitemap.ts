import type { MetadataRoute } from "next";
import { getAllVehicles } from "@/lib/api-server";
import { SITE_URL } from "@/lib/site";
import { vehicleHref } from "@/lib/vehicle";

// /sitemap.xml — lista de todas as páginas para o Google e o Bing (regenerada com o stock)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const vehicles = await getAllVehicles().catch(() => []);
    const newest = vehicles[0]?.created_at ? new Date(vehicles[0].created_at) : new Date();

    return [
        { url: `${SITE_URL}/`, lastModified: newest, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/veiculos`, lastModified: newest, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
        ...vehicles.map((v) => ({
            url: `${SITE_URL}${vehicleHref(v)}`,
            lastModified: v.created_at ? new Date(v.created_at) : undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
