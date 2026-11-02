'use client'

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ListFilter } from "lucide-react";
import { useMemo, useState } from 'react';
import { VehicleCard } from "@/components/app/VehicleCard";
import VehicleFilters, { SelectedFilters } from "@/components/app/vehicleFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle } from "@/lib/types";

const PAGE_SIZE = 9;

const EMPTY_FILTERS: SelectedFilters = {
    bodyStyle: [], fuelType: [], transmissionType: [], tractionType: [], minPrice: "", maxPrice: ""
};

type Ordering = "-created_at" | "retail_price" | "-retail_price" | "vehicle_data__mileage";

function matchesFilters(vehicle: Vehicle, filters: SelectedFilters): boolean {
    const details = vehicle.vehicle_data;
    const price = Number(vehicle.retail_price);
    const inList = (list: number[], id?: number) => list.length === 0 || (id !== undefined && list.includes(id));

    if (filters.minPrice && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

    return inList(filters.fuelType, details.fuel_type?.id)
        && inList(filters.transmissionType, details.transmission_type?.id)
        && inList(filters.bodyStyle, details.body_style?.id)
        && inList(filters.tractionType, details.traction_type?.id);
}

function compareVehicles(ordering: Ordering) {
    return (a: Vehicle, b: Vehicle) => {
        switch (ordering) {
            case "retail_price": return Number(a.retail_price) - Number(b.retail_price);
            case "-retail_price": return Number(b.retail_price) - Number(a.retail_price);
            case "vehicle_data__mileage": return Number(a.vehicle_data.mileage) - Number(b.vehicle_data.mileage);
            default: return (b.created_at ?? "").localeCompare(a.created_at ?? "");
        }
    };
}

// Todo o inventário chega já renderizado do servidor (ISR); filtros, ordenação e
// paginação são feitos no browser, sem pedidos ao backend.
export function VehicleInventory({ vehicles }: { vehicles: Vehicle[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [resetKey, setResetKey] = useState(0);
    const [activeFilters, setActiveFilters] = useState<SelectedFilters>(EMPTY_FILTERS);
    const [ordering, setOrdering] = useState<Ordering>("-created_at");

    const filtered = useMemo(
        () => vehicles.filter((v) => matchesFilters(v, activeFilters)).sort(compareVehicles(ordering)),
        [vehicles, activeFilters, ordering],
    );

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const pageVehicles = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleFiltersUpdate = (filters: SelectedFilters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        handleFiltersUpdate(EMPTY_FILTERS);
        setResetKey(prev => prev + 1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <main className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">

                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground inline-block border-b-4 border-red-600 pb-2">
                        Inventário de Veículos ({totalCount})
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <aside className="hidden lg:block lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-foreground/80">
                            <ListFilter className="size-5 text-red-600" />
                            Filtrar por
                        </div>
                        <VehicleFilters key={resetKey} onFilterChange={handleFiltersUpdate} />
                    </aside>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground pb-2">
                            <div className="lg:hidden w-full sm:w-auto">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="w-full sm:w-auto gap-2">
                                            <ListFilter className="size-4" /> Filtros
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="overflow-y-auto w-[300px]">
                                        <div className="py-6 space-y-8 m-5">
                                            <VehicleFilters key={resetKey} onFilterChange={handleFiltersUpdate} />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <p className="hidden sm:block">
                                Página {currentPage} de {totalPages}. Veículos encontrados: {totalCount}
                            </p>

                            <div className="w-full sm:w-[240px]">
                                <Select onValueChange={(value) => { setOrdering(value as Ordering); setCurrentPage(1); }} defaultValue="-created_at">
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="-created_at">Mais Recente</SelectItem>
                                        <SelectItem value="retail_price">Preço (Crescente)</SelectItem>
                                        <SelectItem value="-retail_price">Preço (Decrescente)</SelectItem>
                                        <SelectItem value="vehicle_data__mileage">Quilometragem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {pageVehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pageVehicles.map((vehicle, index) => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-lg text-gray-500">Nenhum veículo encontrado com estes filtros.</p>
                                <Button variant="link" onClick={handleResetFilters}>
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 pt-10">
                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="hover:bg-gray-100"
                                >
                                    Anterior
                                </Button>

                                <span className="text-sm font-medium px-4">
                                    Página {currentPage} de {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="hover:bg-gray-100"
                                >
                                    Próxima
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
