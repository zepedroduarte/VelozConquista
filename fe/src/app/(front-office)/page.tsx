'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2, ShieldCheck, Award, Headphones, TrendingUp, MapPin, Phone, Mail } from "lucide-react"
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

const stats = [
    { value: "500+", label: "Veículos Vendidos" },
    { value: "10+", label: "Anos de Experiência" },
    { value: "98%", label: "Clientes Satisfeitos" },
    { value: "100%", label: "Transparência" },
];

const features = [
    {
        icon: ShieldCheck,
        title: "Garantia de Qualidade",
        description: "Todos os veículos passam por uma inspeção rigorosa antes de serem colocados à venda.",
    },
    {
        icon: TrendingUp,
        title: "Melhores Preços",
        description: "Oferecemos preços competitivos e opções de financiamento adaptadas ao seu orçamento.",
    },
    {
        icon: Award,
        title: "Reputação Comprovada",
        description: "Mais de uma década no mercado com centenas de clientes satisfeitos.",
    },
    {
        icon: Headphones,
        title: "Apoio Personalizado",
        description: "A nossa equipa está sempre disponível para o acompanhar em todo o processo.",
    },
];

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
        <>
            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-neutral-950 text-white">
                {/* decorative grid */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
                {/* red glow top-right */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-red-600/20 blur-[120px]" />
                {/* red glow bottom-left */}
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-red-800/15 blur-[100px]" />

                <div className="relative mx-auto w-[min(70vw,1200px)] py-28 md:py-36 flex flex-col items-start gap-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-600/40 bg-red-600/10 px-4 py-1.5 text-sm font-medium text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        Stand de Automóveis
                    </span>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        {company?.name ?? "Veloz Conquista"}
                    </h1>

                    <p className="max-w-xl text-lg md:text-xl text-white/70 leading-relaxed">
                        Comércio de automóveis usados e semi‑novos de confiança.
                        Encontre o carro certo para si, ao preço certo.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                        <Link href="/veiculos">
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 shadow-lg shadow-red-900/40 transition-all">
                                Ver Veículos
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/contacto">
                            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all">
                                Contacto
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="relative border-t border-white/10 bg-white/[0.03]">
                    <div className="mx-auto w-[min(70vw,1200px)] grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                        {stats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center py-6 px-4 text-center">
                                <span className="text-2xl md:text-3xl font-bold text-red-500">{s.value}</span>
                                <span className="mt-1 text-xs md:text-sm text-white/60">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED VEHICLES ── */}
            <section className="py-20 bg-gray-50">
                <div className="mx-auto w-[min(70vw,1200px)]">
                    <div className="flex flex-col items-center text-center mb-12">
                        <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-600">Inventário</span>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
                            Últimas Entradas
                        </h2>
                        <p className="mt-3 text-base text-gray-500 max-w-2xl">
                            Descubra as últimas novidades do nosso inventário, selecionadas a pensar em si.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                        </div>
                    ) : featuredVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredVehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-sm">O nosso stock está a ser atualizado. Volte em breve!</p>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link href="/veiculos">
                            <Button variant="outline" size="lg" className="gap-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all">
                                Ver Todos os Veículos
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="py-20 bg-white">
                <div className="mx-auto w-[min(70vw,1200px)]">
                    <div className="flex flex-col items-center text-center mb-12">
                        <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-600">Porquê nós</span>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
                            A Nossa Diferença
                        </h2>
                        <p className="mt-3 text-base text-gray-500 max-w-2xl">
                            Comprometemo‑nos a oferecer a melhor experiência na compra do seu próximo automóvel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="group flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/10 group-hover:bg-red-600 transition-colors duration-200">
                                    <Icon className="h-6 w-6 text-red-600 group-hover:text-white transition-colors duration-200" />
                                </div>
                                <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="relative overflow-hidden bg-red-600 text-white py-16">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="relative mx-auto w-[min(70vw,1200px)] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">Pronto para encontrar o seu carro?</h2>
                        <p className="mt-2 text-red-100 text-sm md:text-base">
                            Contacte‑nos hoje e a nossa equipa terá todo o gosto em ajudá‑lo.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link href="/veiculos">
                            <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-semibold shadow transition-all">
                                Ver Inventário
                            </Button>
                        </Link>
                        <Link href="/contacto">
                            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 transition-all">
                                Falar Connosco
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CONTACT STRIP ── */}
            {company && (
                <section className="py-10 bg-neutral-950 text-white/70">
                    <div className="mx-auto w-[min(70vw,1200px)] flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm">
                        {company.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                                <span>{company.address}</span>
                            </div>
                        )}
                        {company.phone && (
                            <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                <Phone className="h-4 w-4 text-red-500 shrink-0" />
                                <span>{company.phone}</span>
                            </a>
                        )}
                        {company.email && (
                            <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail className="h-4 w-4 text-red-500 shrink-0" />
                                <span>{company.email}</span>
                            </a>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}
