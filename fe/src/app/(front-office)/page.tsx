import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, MapPin, Phone } from "lucide-react"
import { VehicleCard } from "@/components/app/VehicleCard"
import { JsonLd } from "@/components/app/JsonLd"
import { getCompany, getLatestVehicles, getLegalInfo } from "@/lib/api-server"
import { DEFAULT_LOCALITY, openingHoursRows, toLines } from "@/lib/seo"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

export default async function Home() {
    const [featuredVehicles, company, legal] = await Promise.all([getLatestVehicles(3), getCompany(), getLegalInfo().catch(() => null)]);

    const locality = company?.locality || DEFAULT_LOCALITY;
    const hours = openingHoursRows(company);
    const areas = toLines(company?.service_areas);
    const lenders = toLines(legal?.lenders);

    // Perguntas frequentes: só factos que o stand publica (morada, horário, crédito).
    // Ajudam o Google e os assistentes de IA a responder "onde comprar carro usado em Loures?"
    const faq = [
        company?.address && {
            q: `Onde fica o stand da ${company?.name || "Veloz Conquista"}?`,
            a: `Estamos em ${company.address}.`,
        },
        {
            q: "Qual é o horário do stand?",
            a: hours.map((h) => `${h.label}: ${h.text}`).join(". ") + ".",
        },
        legal && {
            q: "Fazem financiamento automóvel?",
            a: `Sim. A ${legal.legal_name} é intermediário de crédito registado no Banco de Portugal (n.º ${legal.credit_intermediary_number}) e apresenta propostas de crédito até 120 meses${lenders.length ? ` com ${lenders.join(", ")}` : ""}.`,
        },
        {
            q: "Como posso marcar uma visita ou pedir mais informações sobre um carro?",
            a: `Ligue${company?.phone ? ` para o ${company.phone}` : ""}, envie email${company?.email ? ` para ${company.email}` : ""} ou use o formulário da página de contactos.`,
        },
        {
            q: `Atendem clientes de fora de ${locality}?`,
            a: `Sim, vendemos para todo o país.${areas.length ? ` A maioria dos clientes vem de ${areas.join(", ")}, mas recebemos regularmente clientes de Leiria, do Algarve e de outras regiões.` : ""}`,
        },
    ].filter(Boolean) as { q: string; a: string }[];

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    };

    return (
        <main className="flex-1">
            <section className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white py-32">
                <div className="w-[70vw] mx-auto flex flex-col items-start justify-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
                        {company?.name || "Veloz Conquista"}
                    </p>
                    <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        Carros usados e semi-novos em {locality}
                    </h1>
                    <p className="mt-4 max-w-lg text-xl text-white/80">
                        Stand em Ponte de Lousa com financiamento até 120 meses e atendimento personalizado.
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

                    {featuredVehicles.length > 0 ? (
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

            <section className="py-16 bg-neutral-50 border-t">
                <div className="w-[90vw] max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-5">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Visite o nosso stand em {locality}</h2>
                        {company?.description && <p className="text-muted-foreground">{company.description}</p>}
                        <ul className="space-y-3 text-sm">
                            {company?.address && (
                                <li className="flex gap-3"><MapPin className="size-5 shrink-0 text-red-600" /><span>{company.address}</span></li>
                            )}
                            {company?.phone && (
                                <li className="flex gap-3"><Phone className="size-5 shrink-0 text-red-600" /><a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-red-600">{company.phone}</a></li>
                            )}
                            <li className="flex gap-3">
                                <Clock className="size-5 shrink-0 text-red-600" />
                                <span>{hours.map((h) => `${h.label}: ${h.text}`).join(" · ")}</span>
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-3">
                            {company?.google_maps_url && (
                                <a href={company.google_maps_url} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-red-600 hover:bg-red-700 text-white">Como chegar</Button>
                                </a>
                            )}
                            <Link href="/contacto"><Button variant="outline">Enviar mensagem</Button></Link>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Perguntas frequentes</h2>
                        {faq.map(({ q, a }) => (
                            <details key={q} className="group rounded-lg border bg-white px-4 py-3">
                                <summary className="cursor-pointer list-none font-medium flex justify-between gap-4">
                                    <h3 className="text-base">{q}</h3>
                                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                                </summary>
                                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
                            </details>
                        ))}
                        <JsonLd data={faq.length ? faqJsonLd : null} />
                    </div>
                </div>
            </section>
        </main>
    );
}
