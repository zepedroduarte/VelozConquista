'use client'

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import { ListFilter, Loader2 } from "lucide-react"; 
import { useState, useEffect } from 'react'; 
import { VehicleCard } from "@/components/app/vehicleCard"; 
import VehicleFilters, { SelectedFilters } from "@/components/app/vehicleFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    year: number;
    mileage: number;
    transmission: string;
    fuel: string;
    engineSize: number;
    price: number;
    imageSrc: string;
}


export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
        bodyStyle: [], fuelType: [], transmissionType: [], tractionType: [], minPrice: "", maxPrice: ""
    });
    
    const [ordering, setOrdering] = useState("-created_at"); // Ordenação padrão

    useEffect(() => {
        async function fetchVehicles() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                
                params.append('page', currentPage.toString());
                params.append('ordering', ordering);

                if (activeFilters.minPrice) params.append('min_price', activeFilters.minPrice);
                if (activeFilters.maxPrice) params.append('max_price', activeFilters.maxPrice);       
                if (activeFilters.fuelType.length) params.append('fuel_type', activeFilters.fuelType.join(','));
                if (activeFilters.transmissionType.length) params.append('transmission', activeFilters.transmissionType.join(','));
                if (activeFilters.bodyStyle.length) params.append('body_style', activeFilters.bodyStyle.join(','));
                if (activeFilters.tractionType.length) params.append('traction', activeFilters.tractionType.join(','));

                const response = await api.get(`/public/vehicles/?${params.toString()}`);
                
                setVehicles(response.data.results);
                setTotalCount(response.data.count);
                
                const pageSize = 9; 
                setTotalPages(Math.ceil(response.data.count / pageSize));

            } catch (error) {
                console.error("Erro ao carregar veículos:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchVehicles();
    }, [currentPage, ordering, activeFilters]);

    const handleFiltersUpdate = (filters: SelectedFilters) => {
        setActiveFilters(filters);
        setCurrentPage(1); 
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
                        <VehicleFilters onFilterChange={handleFiltersUpdate} />
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
                                            <VehicleFilters onFilterChange={handleFiltersUpdate} />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <p className="hidden sm:block">
                                Página {currentPage} de {totalPages || 1}. Veículos encontrados: {totalCount}
                            </p>
                            
                            <div className="w-full sm:w-[240px]">
                                <Select onValueChange={setOrdering} defaultValue="-created_at">
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

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                            </div>
                        ) : vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {vehicles.map((vehicle) => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-lg text-gray-500">Nenhum veículo encontrado com estes filtros.</p>
                                <Button variant="link" onClick={() => handleFiltersUpdate({ bodyStyle: [], fuelType: [], transmissionType: [], tractionType: [], minPrice: "", maxPrice: "" })}>
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 pt-10">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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