// Filtros do inventário: definidos aqui para serem partilhados pela listagem, pela
// pesquisa rápida da página inicial e pelos links "por tipo". Guardados no URL
// (/veiculos?marca=fiat&preco_max=10000) para se poderem partilhar e voltar atrás.
import { Vehicle } from "./types";
import { slugify } from "./vehicle";

export const FACETS = [
    { key: "marca", label: "Marca", get: (v: Vehicle) => v.vehicle_data.make },
    { key: "combustivel", label: "Combustível", get: (v: Vehicle) => v.vehicle_data.fuel_type?.name },
    { key: "caixa", label: "Caixa", get: (v: Vehicle) => v.vehicle_data.transmission_type?.name },
    { key: "segmento", label: "Segmento", get: (v: Vehicle) => v.vehicle_data.body_style?.name },
    { key: "tracao", label: "Tração", get: (v: Vehicle) => v.vehicle_data.traction_type?.name },
] as const;

export const RANGES = [
    { key: "preco_min", label: "Preço desde", test: (v: Vehicle, n: number) => Number(v.retail_price) >= n },
    { key: "preco_max", label: "Preço até", test: (v: Vehicle, n: number) => Number(v.retail_price) <= n },
    { key: "ano_min", label: "Ano desde", test: (v: Vehicle, n: number) => v.vehicle_data.year >= n },
    { key: "km_max", label: "Km até", test: (v: Vehicle, n: number) => Number(v.vehicle_data.mileage) <= n },
] as const;

export type FacetKey = (typeof FACETS)[number]["key"];
export type RangeKey = (typeof RANGES)[number]["key"];
export type Filters = Partial<Record<FacetKey, string[]> & Record<RangeKey, number>>;

export const ORDERINGS = [
    { value: "recentes", label: "Mais recentes", compare: (a: Vehicle, b: Vehicle) => (b.created_at ?? "").localeCompare(a.created_at ?? "") || b.id - a.id },
    { value: "preco", label: "Preço mais baixo", compare: (a: Vehicle, b: Vehicle) => Number(a.retail_price) - Number(b.retail_price) },
    { value: "-preco", label: "Preço mais alto", compare: (a: Vehicle, b: Vehicle) => Number(b.retail_price) - Number(a.retail_price) },
    { value: "km", label: "Menos quilómetros", compare: (a: Vehicle, b: Vehicle) => Number(a.vehicle_data.mileage) - Number(b.vehicle_data.mileage) },
    { value: "-ano", label: "Mais novos", compare: (a: Vehicle, b: Vehicle) => b.vehicle_data.year - a.vehicle_data.year },
] as const;

export type Ordering = (typeof ORDERINGS)[number]["value"];

export function matches(vehicle: Vehicle, filters: Filters, skip?: FacetKey): boolean {
    for (const facet of FACETS) {
        const wanted = filters[facet.key];
        if (facet.key === skip || !wanted?.length) continue;
        const value = facet.get(vehicle);
        if (!value || !wanted.includes(slugify(value))) return false;
    }
    return RANGES.every((range) => filters[range.key] === undefined || range.test(vehicle, filters[range.key]!));
}

export function applyFilters(vehicles: Vehicle[], filters: Filters, ordering: Ordering = "recentes"): Vehicle[] {
    const compare = ORDERINGS.find((o) => o.value === ordering)?.compare ?? ORDERINGS[0].compare;
    return vehicles.filter((v) => matches(v, filters)).sort(compare);
}

/** Opções de um filtro com o nº de viaturas, tendo em conta os outros filtros escolhidos. */
export function facetOptions(vehicles: Vehicle[], key: FacetKey, filters: Filters = {}) {
    const facet = FACETS.find((f) => f.key === key)!;
    const options = new Map<string, { value: string; label: string; count: number }>();
    for (const vehicle of vehicles) {
        const label = facet.get(vehicle);
        if (!label) continue;
        const value = slugify(label);
        const option = options.get(value) ?? { value, label, count: 0 };
        if (matches(vehicle, filters, key)) option.count++;
        options.set(value, option);
    }
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "pt"));
}

export function countActive(filters: Filters): number {
    return FACETS.reduce((n, f) => n + (filters[f.key]?.length ?? 0), 0)
        + RANGES.filter((r) => filters[r.key] !== undefined).length;
}

export function parseQuery(search: string): { filters: Filters; ordering: Ordering } {
    const params = new URLSearchParams(search);
    const filters: Filters = {};
    for (const { key } of FACETS) {
        const values = params.get(key)?.split(",").filter(Boolean);
        if (values?.length) filters[key] = values;
    }
    for (const { key } of RANGES) {
        const n = Number(params.get(key));
        if (params.get(key) && Number.isFinite(n)) filters[key] = n;
    }
    const ordem = params.get("ordem");
    const ordering = ORDERINGS.find((o) => o.value === ordem)?.value ?? "recentes";
    return { filters, ordering };
}

export function toQuery(filters: Filters, ordering: Ordering = "recentes"): string {
    const params = new URLSearchParams();
    for (const { key } of FACETS) if (filters[key]?.length) params.set(key, filters[key]!.join(","));
    for (const { key } of RANGES) if (filters[key] !== undefined) params.set(key, String(filters[key]));
    if (ordering !== "recentes") params.set("ordem", ordering);
    // Vírgulas legíveis no endereço (?marca=fiat,vw)
    const query = params.toString().replace(/%2C/g, ",");
    return query ? `?${query}` : "";
}

/** Valores sugeridos para os seletores de preço, ano e quilómetros. */
export const PRICE_STEPS = [2500, 5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000];
export const KM_STEPS = [25000, 50000, 75000, 100000, 150000, 200000, 250000];

export function yearSteps(vehicles: Vehicle[]): number[] {
    const years = vehicles.map((v) => v.vehicle_data.year).filter(Boolean);
    if (!years.length) return [];
    const max = Math.max(...years);
    return Array.from({ length: max - Math.min(...years) + 1 }, (_, i) => max - i);
}
