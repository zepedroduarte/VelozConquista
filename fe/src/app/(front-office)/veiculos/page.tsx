import type { Metadata } from "next";
import { VehicleInventory } from "@/components/app/VehicleInventory";
import { getAllVehicles } from "@/lib/api-server";

export const metadata: Metadata = {
    title: "Viaturas Usadas e Semi-Novas | Veloz Conquista",
    description: "Consulte o inventário de viaturas usadas e semi-novas disponíveis na Veloz Conquista.",
};

export default async function VehiclesPage() {
    const vehicles = await getAllVehicles();
    return <VehicleInventory vehicles={vehicles} />;
}
