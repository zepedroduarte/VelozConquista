'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2 } from "lucide-react"
import { VehicleCard } from "@/components/app/VehicleCard"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { APIVehicleData } from "@/lib/types"
import { useCompany } from "@/context/CompanyContext"

export interface Vehicle {
    id: number;
    retail_price: string;
    status: { id: number, name: string };
    vehicle_data: APIVehicleData;
    created_at?: string;
}

export default function Home() {
    const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { company } = useCompany();

    useEffect(() => {
        async function fetchFeatured() {
            try {
                const params = new URLSearchParams();
                params.append('ordering', '-created_at');

                const response = await api.get(`/vehicles/?${params.toString()}`);
                
                let data: Vehicle[] = [];

                if (response.data.results) {
                    data = response.data.results;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                }

                setFeaturedVehicles(data.slice(0, 3));

            } catch (error) {
                console.error("Erro ao carregar destaques:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFeatured();
    }, []);

    return (
        <main className="flex-1">
            <section className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white py-32">
                <div className="w-[70vw] mx-auto flex flex-col items-start justify-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        {company?.name || "Veloz Conquista"}
                    </h1>
                    <p className="mt-4 max-w-lg text-xl text-white/80">
                        Comércio de automóveis usados e semi-novos de confiança.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link href="/veiculos">
                            <Button
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white transition-all"
                            >
                                Ver Veículos
                            </Button>
                        </Link>
                        <Link href="/contacto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-black dark:text-white hover:bg-white/90 transition-all"
                            >
                                Contacto
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="w-[70vw] mx-auto">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
                            Últimas Entradas
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                            Descubra as últimas novidades do nosso inventário.
                        </p>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                        </div>
                    ) : featuredVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredVehicles.map((vehicle, index) => (
                                <VehicleCard 
                                    key={vehicle.id} 
                                    vehicle={vehicle}
                                    priority={index < 3}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-muted-foreground">O nosso stock está a ser atualizado. Volte em breve!</p>
                        </div>
                    )}
                    
                    <div className="mt-12 text-center">
                        <Link href="/veiculos">
                            <Button variant="outline" size="lg" className="gap-2 border-gray-300 hover:bg-gray-100">
                                Ver Todos os Veículos
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}