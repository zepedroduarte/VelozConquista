// /llms.txt — resumo do stand em texto simples para assistentes de IA (ChatGPT, Claude,
// Perplexity...). Formato proposto em https://llmstxt.org. Regenerado com o stock (ISR).
import { getAllVehicles, getCompany, getLegalInfo } from "@/lib/api-server";
import { DEFAULT_LOCALITY, openingHoursRows, toLines } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { formatMileage, formatPrice, vehicleHref, vehicleTitle } from "@/lib/vehicle";

export const revalidate = 3600;

export async function GET() {
    const [company, legal, vehicles] = await Promise.all([
        getCompany(),
        getLegalInfo().catch(() => null),
        getAllVehicles().catch(() => []),
    ]);

    const name = company?.name || "Veloz Conquista";
    const locality = company?.locality || DEFAULT_LOCALITY;
    const areas = toLines(company?.service_areas);

    const lines = [
        `# ${name}`,
        "",
        `> Stand de automóveis usados e semi-novos em ${company?.address || locality}, Portugal. Vende carros usados com financiamento automóvel até 120 meses.`,
        "",
        company?.description ?? "",
        "",
        "## Contactos",
        "",
        company?.address && `- Morada: ${company.address}`,
        company?.phone && `- Telefone: ${company.phone}`,
        company?.email && `- Email: ${company.email}`,
        company?.google_maps_url && `- Google Maps: ${company.google_maps_url}`,
        `- Horário: ${openingHoursRows(company).map((h) => `${h.label} ${h.text}`).join("; ")}`,
        `- Vende para todo o país${areas.length ? `; maioria dos clientes de ${areas.join(", ")}` : ""}`,
        "",
        legal && "## Financiamento",
        legal && "",
        legal && `${legal.legal_name} é intermediário de crédito a título acessório registado no Banco de Portugal (n.º ${legal.credit_intermediary_number}). Mutuantes: ${toLines(legal.lenders).join(", ")}.`,
        legal && "",
        `## Viaturas à venda (${vehicles.length})`,
        "",
        ...vehicles.map((v) => {
            const d = v.vehicle_data;
            return `- [${vehicleTitle(v)} (${d.year})](${SITE_URL}${vehicleHref(v)}): ${formatPrice(v.retail_price)}, ${formatMileage(d.mileage)}, ${d.fuel_type?.name}, caixa ${d.transmission_type?.name?.toLowerCase()}`;
        }),
        "",
        "## Páginas",
        "",
        `- [Todas as viaturas](${SITE_URL}/veiculos): stock atualizado com preços e fotos`,
        `- [Contactos e localização](${SITE_URL}/contacto)`,
        `- [Sobre nós e informação de crédito](${SITE_URL}/sobre)`,
    ].filter((line): line is string => typeof line === "string");

    return new Response(lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
