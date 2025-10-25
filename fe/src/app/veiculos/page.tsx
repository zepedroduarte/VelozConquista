'use client'

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import Link from "next/link";
import { ListFilter, SlidersHorizontal, ChevronRight } from "lucide-react"; 
import { useState, useMemo } from 'react'; 
import { VehicleCard } from "@/components/app/VehicleCard"; 

// --- DADOS MOCK (mantida para funcionalidade) ---
const MOCK_VEHICLES = [
    { id: 1, make: "Mercedes-Benz", model: "Classe C 220d", year: 2023, mileage: 2500, transmission: "Automática", fuel: "Diesel", engineSize: 2.0, price: 34599.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Merc" },
    { id: 2, make: "BMW", model: "Série 3 320i", year: 2021, mileage: 45000, transmission: "Automática", fuel: "Gasolina", engineSize: 2.0, price: 28999.00, imageSrc: "/placeholder.svg?height=200&width=400&text=BMW" },
    { id: 3, make: "Renault", model: "Clio 1.0 TCe", year: 2019, mileage: 80000, transmission: "Manual", fuel: "Gasolina", engineSize: 1.0, price: 13500.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Clio" },
    { id: 4, make: "Audi", model: "A4 Avant", year: 2022, mileage: 18000, transmission: "Automática", fuel: "Diesel", engineSize: 2.0, price: 38000.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Audi" },
    { id: 5, make: "Toyota", model: "Yaris Hybrid", year: 2024, mileage: 500, transmission: "Automática", fuel: "Híbrido", engineSize: 1.5, price: 21500.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Yaris" },
    { id: 6, make: "Tesla", model: "Model 3", year: 2020, mileage: 55000, transmission: "Automática", fuel: "Elétrico", engineSize: 0, price: 42000.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Tesla" },
    { id: 7, make: "VW", model: "Golf 8", year: 2021, mileage: 32000, transmission: "Manual", fuel: "Gasolina", engineSize: 1.5, price: 22000.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Golf" },
    { id: 8, make: "Peugeot", model: "208", year: 2022, mileage: 15000, transmission: "Manual", fuel: "Diesel", engineSize: 1.5, price: 17800.00, imageSrc: "/placeholder.svg?height=200&width=400&text=208" },
    { id: 9, make: "Ford", model: "Focus", year: 2018, mileage: 110000, transmission: "Manual", fuel: "Diesel", engineSize: 1.6, price: 11900.00, imageSrc: "/placeholder.svg?height=200&width=400&text=Focus" },
    { id: 10, make: "Fiat", model: "500", year: 2023, mileage: 8000, transmission: "Automática", fuel: "Gasolina", engineSize: 1.0, price: 16500.00, imageSrc: "/placeholder.svg?height=200&width=400&text=500" },
];

const MOCK_FILTERS = [
    { title: "Tipo de Combustível", key: "fuel", options: ["Diesel", "Gasolina", "Elétrico", "Híbrido"] },
    { title: "Transmissão", key: "transmission", options: ["Automática", "Manual"] },
    { title: "Carroçaria", key: "body", options: ["Sedan", "SUV", "Hatchback", "Familiar"] },
];
// --- FIM MOCK DATA ---


export default function VehiclesPage() {
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const vehiclesPerPage = 6;

    const currentVehicles = useMemo(() => {
        const startIndex = (currentPage - 1) * vehiclesPerPage;
        const endIndex = startIndex + vehiclesPerPage;
        return MOCK_VEHICLES.slice(startIndex, endIndex);
    }, [currentPage]);
    
    const totalPages = Math.ceil(MOCK_VEHICLES.length / vehiclesPerPage);
    
    const renderPagination = () => {
        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center space-x-2 pt-8">
                <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    Anterior
                </Button>
                
                {pageNumbers.map(number => (
                    <Button
                        key={number}
                        variant={number === currentPage ? 'default' : 'outline'}
                        className={number === currentPage ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </Button>
                ))}

                <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    Próxima
                </Button>
            </div>
        );
    };


    const renderFilterContent = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 border-b border-border">
                <ListFilter className="size-5 text-red-600" /> Filtrar por
            </h3>
            
            <Card className="p-4 space-y-3">
                <CardTitle className="text-base font-semibold">Preço (€)</CardTitle>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder="Min" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                    />
                    <Input 
                        type="number" 
                        placeholder="Max" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                    />
                </div>
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">Aplicar</Button>
            </Card>

            {MOCK_FILTERS.map(filter => (
                <Card key={filter.key} className="p-4 space-y-3">
                    <CardTitle className="text-base font-semibold">{filter.title}</CardTitle>
                    <div className="space-y-1">
                        {filter.options.map(option => (
                            <div key={option} className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground/80 cursor-pointer">
                                <input type="checkbox" id={option} name={option} className="form-checkbox" />
                                <label htmlFor={option}>{option}</label>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <main className="flex-1 py-16">
            <div className="w-[70vw] mx-auto space-y-8">
                
                <h1 className="text-4xl font-bold tracking-tight border-b-2 border-red-600 inline-block pb-1">
                    Inventário de Veículos ({MOCK_VEHICLES.length})
                </h1>
                

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    <div className="lg:col-span-1 hidden lg:block space-y-6 sticky top-20 h-fit">
                        {renderFilterContent()}
                    </div>
                    
                    <div className="lg:col-span-3 space-y-6">
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm">
                                            <ListFilter className="size-4" /> Filtros
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-3/4 sm:max-w-xs overflow-y-auto">
                                        <div className="py-4">
                                            {renderFilterContent()}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                            
                            <p className="hidden sm:block">Página {currentPage} de {totalPages}. Veículos encontrados: {MOCK_VEHICLES.length}</p>
                            
                            <select className="border rounded-md p-2 bg-background">
                                <option>Ordenar por: Mais Recente</option>
                                <option>Ordenar por: Preço (Crescente)</option>
                                <option>Ordenar por: Preço (Decrescente)</option>
                                <option>Ordenar por: Quilometragem</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {currentVehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>

                        {renderPagination()}
                    </div>
                </div>

            </div>
        </main>
    );
}