import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard } from "@/components/app/VehicleCard" 
const FEATURED_VEHICLES = [
    {
        id: 1,
        make: "Mercedes-Benz",
        model: "Classe C",
        year: 2023,
        mileage: 2500,
        transmission: "Automática",
        fuel: "Gasolina",
        engineSize: 2.0,
        price: 34599.00,
        imageSrc: "/placeholder.svg?height=200&width=400&text=Featured+1",
    },
    {
        id: 2,
        make: "BMW",
        model: "Série 3",
        year: 2021,
        mileage: 45000,
        transmission: "Automática",
        fuel: "Diesel",
        engineSize: 2.0,
        price: 28999.00,
        imageSrc: "/placeholder.svg?height=200&width=400&text=Featured+2",
    },
    {
        id: 3,
        make: "Renault",
        model: "Clio",
        year: 2019,
        mileage: 80000,
        transmission: "Manual",
        fuel: "Gasolina",
        engineSize: 1.0,
        price: 13500.00,
        imageSrc: "/placeholder.svg?height=200&width=400&text=Featured+3",
    },
];

export default function Home() {
    return (
        <main className="flex-1">
            <section className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white py-32">
                <div className="w-[70vw] mx-auto flex flex-col items-start justify-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        Veloz Conquista
                    </h1>
                    <p className="mt-4 max-w-lg text-xl text-white/80">
                        Comércio de automóveis usados e semi-novos.
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
                                className="border-white text-black hover:bg-white/90 transition-all"
                            >
                                Contacto
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="w-[70vw] mx-auto">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Veículos em Destaque</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                            Descubra a nossa seleção de veículos seminovos e usados.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURED_VEHICLES.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                        ))}
                    </div>
                    
                    <div className="mt-12 text-center">
                        <Link href="/veiculos">
                            <Button variant="outline" size="lg" className="gap-2">
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