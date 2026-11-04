import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
    BadgeEuro, Calendar, Car, ChevronLeft, CircleGauge, DoorOpen, Fuel, Gauge, Mail, MapPin,
    MessageCircle, Palette, Phone, Ruler, Settings2, Truck, Users, Zap,
} from "lucide-react";
import { VehicleGallery } from "@/components/app/VehicleGallery";
import { VehicleCard } from "@/components/app/VehicleCard";
import { ShareButton } from "@/components/app/ShareButton";
import { JsonLd } from "@/components/app/JsonLd";
import { DEFAULT_LOCALITY, breadcrumbJsonLd, carJsonLd, telHref, whatsappHref } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { getAllVehicles, getCompany, getVehicle } from "@/lib/api-server";
import { Vehicle } from "@/lib/types";
import {
    formatMileage, formatEngineSize, formatPower, formatPrice, getImageUrl,
    getPrimaryImageUrl, PLACEHOLDER_IMAGE, vehicleHref, vehicleIdFromSlug, vehicleSlug, vehicleTitle
} from "@/lib/vehicle";

interface VehicleDetailsProps {
    params: Promise<{ id: string }>;
}

// Pré-gera todas as viaturas no build; viaturas novas são geradas no primeiro acesso.
export async function generateStaticParams() {
    try {
        const vehicles = await getAllVehicles();
        return vehicles.map((v) => ({ id: vehicleSlug(v) }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: VehicleDetailsProps): Promise<Metadata> {
    const { id } = await params;
    const [vehicle, company] = await Promise.all([getVehicle(vehicleIdFromSlug(id) ?? ""), getCompany()]);
    if (!vehicle) return { title: "Veículo não encontrado" };

    const details = vehicle.vehicle_data;
    const locality = company?.locality || "Loures";
    const title = `${vehicleTitle(vehicle)} ${details.year} usado em ${locality} · ${formatPrice(vehicle.retail_price)}`;
    const description = `${details.make} ${details.model} de ${details.year} à venda em ${locality}: ${formatMileage(details.mileage)}, ${details.fuel_type.name}, caixa ${details.transmission_type.name.toLowerCase()}. ${formatPrice(vehicle.retail_price)}, financiamento até 120 meses.`;
    const image = getPrimaryImageUrl(vehicle);

    return {
        title,
        description,
        alternates: { canonical: vehicleHref(vehicle) },
        openGraph: {
            title,
            description,
            images: image !== PLACEHOLDER_IMAGE ? [image] : undefined,
        },
    };
}

/** Até 3 viaturas parecidas: mesmo tipo de carroçaria primeiro, depois preço mais próximo. */
function similarVehicles(vehicles: Vehicle[], current: Vehicle, limit = 3): Vehicle[] {
    const price = Number(current.retail_price);
    const bodyStyle = current.vehicle_data.body_style?.id;
    return vehicles
        .filter((v) => v.id !== current.id)
        .map((v) => ({
            v,
            score: (v.vehicle_data.body_style?.id === bodyStyle ? 0 : 1) * 1e9 + Math.abs(Number(v.retail_price) - price),
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map(({ v }) => v);
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsProps) {
    const { id } = await params;
    const [vehicle, company, allVehicles] = await Promise.all([
        getVehicle(vehicleIdFromSlug(id) ?? ""),
        getCompany(),
        getAllVehicles().catch(() => [] as Vehicle[]),
    ]);

    if (!vehicle) notFound();

    // Links antigos (/veiculos/20) ou com o nome desatualizado → endereço oficial
    if (id !== vehicleSlug(vehicle)) permanentRedirect(vehicleHref(vehicle));

    const details = vehicle.vehicle_data;
    const title = vehicleTitle(vehicle);
    const price = formatPrice(vehicle.retail_price);
    const available = !vehicle.status || vehicle.status.name === "Disponível";
    const locality = company?.locality || DEFAULT_LOCALITY;
    const others = similarVehicles(allVehicles, vehicle);

    // Imagem principal primeiro
    const sortedImages = [...(details.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    const galleryUrls = sortedImages.length > 0
        ? sortedImages.map((img) => getImageUrl(img.image))
        : [PLACEHOLDER_IMAGE];

    const contactHref = `/contacto?viatura=${vehicle.id}`;
    const phone = company?.phone;
    const whatsapp = company?.whatsapp_number || phone;
    const whatsappText = `Olá! Tenho interesse no ${title} de ${details.year} (${price.replace(/ /g, " ")}). Ainda está disponível? ${SITE_URL}${vehicleHref(vehicle)}`;

    const highlights = [details.year, formatMileage(details.mileage), details.fuel_type?.name, details.transmission_type?.name, formatPower(details.power)]
        .filter(Boolean);

    const overview = [
        { icon: Calendar, label: "Ano", value: details.year },
        { icon: Gauge, label: "Quilómetros", value: formatMileage(details.mileage) },
        { icon: Fuel, label: "Combustível", value: details.fuel_type?.name },
        { icon: Settings2, label: "Caixa", value: details.transmission_type?.name },
        { icon: Zap, label: "Potência", value: formatPower(details.power) },
        { icon: Ruler, label: "Cilindrada", value: formatEngineSize(details.engine_size) },
        { icon: Car, label: "Segmento", value: details.body_style?.name },
        { icon: CircleGauge, label: "Tração", value: details.traction_type?.name },
        { icon: DoorOpen, label: "Portas", value: details.doors || null },
        { icon: Users, label: "Lugares", value: details.seats || null },
        { icon: Palette, label: "Cor", value: details.color },
    ].filter((item) => item.value);

    return (
        <main className="pb-12 lg:pb-16">
            <JsonLd data={carJsonLd(vehicle)} />
            <JsonLd data={breadcrumbJsonLd([
                { name: "Início", path: "/" },
                { name: "Viaturas", path: "/veiculos" },
                { name: title, path: vehicleHref(vehicle) },
            ])} />

            <div className="site-container">
                <div className="flex h-12 items-center justify-between text-sm">
                    <Link href="/veiculos" className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-red-600">
                        <ChevronLeft className="size-4" aria-hidden /> Viaturas
                    </Link>
                    <ShareButton title={title} className="font-medium text-muted-foreground hover:text-red-600" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
                    <VehicleGallery images={galleryUrls} alt={`${details.make} ${details.model} ${details.year}`} />

                    {/* Resumo: por baixo das fotos no telemóvel, coluna fixa à direita no computador */}
                    <section aria-label="Resumo" className="self-start lg:sticky lg:top-24 lg:row-span-2 lg:row-start-1 lg:col-start-2">
                        <div className="lg:rounded-xl lg:border lg:p-6">
                            {!available && (
                                <span className="mb-2 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                                    {vehicle.status.name}
                                </span>
                            )}
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{details.make} {details.model}</h1>
                            {details.version && <p className="mt-1 text-muted-foreground">{details.version}</p>}
                            <p className="mt-3 text-sm text-foreground/80">{highlights.join(" · ")}</p>

                            <p className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{price}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <BadgeEuro className="size-4 text-red-600" aria-hidden /> Financiamento até 120 meses
                            </p>

                            <div className="mt-6 hidden space-y-3 lg:block">
                                <Link href={contactHref} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700">
                                    <Mail className="size-5" aria-hidden /> Pedir informações
                                </Link>
                                <div className="grid grid-cols-2 gap-3">
                                    {phone && (
                                        <a href={telHref(phone)} className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white">
                                            <Phone className="size-4" aria-hidden /> {phone}
                                        </a>
                                    )}
                                    {whatsapp && (
                                        <a href={whatsappHref(whatsapp, whatsappText)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-green-600 text-sm font-semibold text-green-700 hover:bg-green-600 hover:text-white">
                                            <MessageCircle className="size-4" aria-hidden /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>

                            <ul className="mt-6 space-y-2 border-t pt-5 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <MapPin className="size-4 shrink-0 text-red-600" aria-hidden />
                                    <span>No stand em {locality}{company?.address ? ` · ${company.address}` : ""}</span>
                                </li>
                                <li className="flex gap-2">
                                    <Truck className="size-4 shrink-0 text-red-600" aria-hidden />
                                    <span>Vendemos para todo o país</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section aria-labelledby="overview-heading" className="lg:col-start-1">
                        <h2 id="overview-heading" className="mb-4 text-xl font-bold tracking-tight md:text-2xl">Visão geral</h2>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {overview.map(({ icon: Icon, label, value }) => (
                                <li key={label} className="flex items-center gap-3 rounded-lg bg-neutral-100 p-3">
                                    <Icon className="size-5 shrink-0 text-red-600" aria-hidden />
                                    <div className="min-w-0">
                                        <p className="text-xs text-neutral-600">{label}</p>
                                        <p className="truncate font-semibold">{value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {others.length > 0 && (
                    <section aria-labelledby="others-heading" className="mt-12 border-t pt-10">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <h2 id="others-heading" className="text-xl font-bold tracking-tight md:text-2xl">Outras viaturas</h2>
                            <Link href="/veiculos" className="text-sm font-semibold text-red-600 hover:underline">Ver todas</Link>
                        </div>
                        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                            {others.map((v) => (
                                <div key={v.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                                    <VehicleCard vehicle={v} sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 400px" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Barra de contacto fixa no telemóvel */}
            <div data-contact-bar className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
                <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 text-sm font-semibold">
                    <Link href={contactHref} className="flex h-12 flex-col items-center justify-center rounded-lg border-2 border-neutral-900 leading-tight">
                        <Mail className="size-4" aria-hidden /> Mensagem
                    </Link>
                    {phone && (
                        <a href={telHref(phone)} className="flex h-12 flex-col items-center justify-center rounded-lg bg-red-600 leading-tight text-white">
                            <Phone className="size-4" aria-hidden /> Ligar
                        </a>
                    )}
                    {whatsapp && (
                        <a href={whatsappHref(whatsapp, whatsappText)} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-col items-center justify-center rounded-lg bg-green-700 leading-tight text-white">
                            <MessageCircle className="size-4" aria-hidden /> WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </main>
    );
}
