import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BadgeEuro, ChevronRight, Clock, Landmark, MapPin, Phone, Truck } from "lucide-react"
import { VehicleCard } from "@/components/app/VehicleCard"
import { QuickSearch } from "@/components/app/QuickSearch"
import { JsonLd } from "@/components/app/JsonLd"
import { getAllVehicles, getCompany, getLegalInfo } from "@/lib/api-server"
import { facetOptions, toQuery } from "@/lib/inventory"
import { DEFAULT_LOCALITY, openingHoursRows, telHref, toLines } from "@/lib/seo"
import { slugify } from "@/lib/vehicle"

export const metadata: Metadata = {
    alternates: { canonical: "/" },
}

export default async function Home() {
    const [vehicles, company, legal] = await Promise.all([getAllVehicles(), getCompany(), getLegalInfo().catch(() => null)]);
    const latest = vehicles.slice(0, 6);
    const makes = facetOptions(vehicles, "marca");
    const bodyStyles = facetOptions(vehicles, "segmento");

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

    const highlights = [
        { icon: BadgeEuro, text: "Financiamento até 120 meses" },
        legal && { icon: Landmark, text: "Intermediário de crédito registado no Banco de Portugal" },
        { icon: Truck, text: "Vendemos para todo o país" },
    ].filter(Boolean) as { icon: typeof BadgeEuro; text: string }[];

    return (
        <main>
            <section className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-white">
                <div className="site-container grid items-center gap-6 py-8 md:py-14 lg:grid-cols-[1fr_400px] lg:gap-12">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-red-500 sm:text-sm">
                            {company?.name || "Veloz Conquista"}
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Carros usados e semi-novos em {locality}
                        </h1>
                        <p className="mt-3 max-w-xl text-base text-white/75 md:text-lg">
                            Stand em {locality} com financiamento até 120 meses e atendimento personalizado.
                        </p>
                        <ul className="mt-5 hidden flex-wrap gap-x-6 gap-y-2 text-sm text-white/85 sm:flex">
                            {highlights.map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-center gap-2"><Icon className="size-4 text-red-500" aria-hidden /> {text}</li>
                            ))}
                        </ul>
                    </div>
                    <QuickSearch
                        makes={makes.map(({ value, label }) => ({ value, label }))}
                        stock={vehicles.map((v) => ({ make: slugify(v.vehicle_data.make), price: Number(v.retail_price) }))}
                    />
                </div>
            </section>

            <section className="py-10 md:py-14">
                <div className="site-container">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Últimas entradas</h2>
                            <p className="mt-1 text-sm text-muted-foreground">As viaturas que chegaram mais recentemente ao stand.</p>
                        </div>
                        <Link href="/veiculos" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-red-600 hover:underline sm:flex">
                            Ver todas ({vehicles.length}) <ArrowRight className="size-4" aria-hidden />
                        </Link>
                    </div>

                    {latest.length > 0 ? (
                        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                            {latest.map((vehicle, index) => (
                                <div key={vehicle.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                                    <VehicleCard
                                        vehicle={vehicle}
                                        priority={index === 0}
                                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 400px"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-neutral-50 py-12 text-center">
                            <p className="text-muted-foreground">O nosso stock está a ser atualizado. Volte em breve!</p>
                        </div>
                    )}

                    <Link
                        href="/veiculos"
                        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white sm:mx-auto sm:max-w-xs"
                    >
                        Ver todas as {vehicles.length} viaturas <ArrowRight className="size-4" aria-hidden />
                    </Link>

                    {bodyStyles.length > 1 && (
                        <div className="mt-10">
                            <h2 className="mb-3 text-lg font-semibold">Procurar por tipo</h2>
                            <ul className="flex flex-wrap gap-2">
                                {bodyStyles.map((b) => (
                                    <li key={b.value}>
                                        <Link
                                            href={`/veiculos${toQuery({ segmento: [b.value] })}`}
                                            className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-medium hover:border-red-600 hover:text-red-600"
                                        >
                                            {b.label} <span className="text-xs text-muted-foreground">{b.count}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            <section className="border-t bg-neutral-50 py-12 md:py-16">
                <div className="site-container grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div className="space-y-5">
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Visite o nosso stand em {locality}</h2>
                        {company?.description && <p className="text-muted-foreground">{company.description}</p>}
                        <ul className="space-y-3 text-sm">
                            {company?.address && (
                                <li className="flex gap-3"><MapPin className="size-5 shrink-0 text-red-600" /><span>{company.address}</span></li>
                            )}
                            {company?.phone && (
                                <li className="flex gap-3"><Phone className="size-5 shrink-0 text-red-600" /><a href={telHref(company.phone)} className="hover:text-red-600">{company.phone}</a></li>
                            )}
                            <li className="flex gap-3">
                                <Clock className="size-5 shrink-0 text-red-600" />
                                <span>{hours.map((h) => `${h.label}: ${h.text}`).join(" · ")}</span>
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-3">
                            {company?.google_maps_url && (
                                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                                    <a href={company.google_maps_url} target="_blank" rel="noopener noreferrer">Como chegar</a>
                                </Button>
                            )}
                            <Button asChild size="lg" variant="outline"><Link href="/contacto">Enviar mensagem</Link></Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
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
