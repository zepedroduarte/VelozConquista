'use client'

// Painel de filtros: seletores nativos (abrem a roda do telemóvel) e botões "chip" grandes
// em vez de caixas de seleção pequenas. Cada opção mostra quantas viaturas ficam.
import { Vehicle } from "@/lib/types";
import {
    FACETS, FacetKey, Filters, KM_STEPS, PRICE_STEPS, RangeKey, facetOptions, yearSteps,
} from "@/lib/inventory";
import { formatMileage, formatPrice } from "@/lib/vehicle";

export const selectClass = "h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-red-600";

interface FilterPanelProps {
    vehicles: Vehicle[];
    filters: Filters;
    onChange: (filters: Filters) => void;
}

export function FilterPanel({ vehicles, filters, onChange }: FilterPanelProps) {
    const years = yearSteps(vehicles);

    const setRange = (key: RangeKey, value: string) => {
        const next = { ...filters };
        if (value) next[key] = Number(value); else delete next[key];
        onChange(next);
    };

    const toggle = (key: FacetKey, value: string) => {
        const current = filters[key] ?? [];
        const values = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        const next = { ...filters, [key]: values };
        if (!values.length) delete next[key];
        onChange(next);
    };

    const rangeSelect = (key: RangeKey, label: string, steps: number[], format: (n: number) => string) => (
        <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <select className={selectClass} value={filters[key] ?? ""} onChange={(e) => setRange(key, e.target.value)}>
                <option value="">Qualquer</option>
                {steps.map((n) => <option key={n} value={n}>{format(n)}</option>)}
            </select>
        </label>
    );

    return (
        <div className="space-y-6">
            <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-semibold">Preço</legend>
                <div className="grid grid-cols-2 gap-3">
                    {rangeSelect("preco_min", "Desde", PRICE_STEPS, (n) => formatPrice(n))}
                    {rangeSelect("preco_max", "Até", PRICE_STEPS, (n) => formatPrice(n))}
                </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
                {rangeSelect("ano_min", "Ano desde", years, String)}
                {rangeSelect("km_max", "Quilómetros até", KM_STEPS, formatMileage)}
            </div>

            {FACETS.map(({ key, label }) => {
                const options = facetOptions(vehicles, key, filters);
                if (options.length < 2 && !filters[key]?.length) return null;
                return (
                    <fieldset key={key}>
                        <legend className="mb-2 text-sm font-semibold">{label}</legend>
                        <div className="flex flex-wrap gap-2">
                            {options.map((option) => {
                                const selected = filters[key]?.includes(option.value) ?? false;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        disabled={!selected && option.count === 0}
                                        onClick={() => toggle(key, option.value)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors hover:border-neutral-400 disabled:opacity-40 disabled:hover:border-input aria-pressed:border-red-600 aria-pressed:bg-red-50 aria-pressed:text-red-700"
                                    >
                                        {option.label}
                                        <span className="text-xs text-muted-foreground">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                );
            })}
        </div>
    );
}
