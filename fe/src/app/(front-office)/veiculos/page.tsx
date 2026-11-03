import type { Metadata } from "next";
import { VehicleInventory } from "@/components/app/VehicleInventory";
import { JsonLd } from "@/components/app/JsonLd";
import { getAllVehicles } from "@/lib/api-server";
import { SITE_URL } from "@/lib/site";
import { vehicleHref, vehicleTitle } from "@/lib/vehicle";

export const metadata: Metadata = {
    title: "Carros Usados à Venda em Loures",
    description: "Todos os carros usados e semi-novos à venda na Veloz Conquista, em Loures: preços, quilómetros e fotos. Financiamento até 120 meses.",
    alternates: { canonical: "/veiculos" },
};

export default async function VehiclesPage() {
    const vehicles = await getAllVehicles();

    const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Carros usados à venda na Veloz Conquista",
        numberOfItems: vehicles.length,
        itemListElement: vehicles.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}${vehicleHref(v)}`,
            name: `${vehicleTitle(v)} ${v.vehicle_data.year}`,
        })),
    };

    return (
        <>
            <JsonLd data={itemList} />
            <VehicleInventory vehicles={vehicles} />
        </>
    );
}
