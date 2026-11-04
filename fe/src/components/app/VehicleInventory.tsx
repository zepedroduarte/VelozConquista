'use client'

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VehicleCard } from "@/components/app/VehicleCard";
import { FilterPanel, selectClass } from "@/components/app/FilterPanel";
import { Vehicle } from "@/lib/types";
import {
    FACETS, Filters, ORDERINGS, Ordering, RANGES, applyFilters, countActive, facetOptions, parseQuery, toQuery,
} from "@/lib/inventory";
import { formatMileage, formatPrice } from "@/lib/vehicle";

const PAGE_SIZE = 12;

const RANGE_LABEL: Record<string, (n: number) => string> = {
    preco_min: (n) => `Desde ${formatPrice(n)}`,
    preco_max: (n) => `Até ${formatPrice(n)}`,
    ano_min: (n) => `Desde ${n}`,
    km_max: (n) => `Até ${formatMileage(n)}`,
};

// Todo o inventário chega já renderizado do servidor (ISR); filtros, ordenação e
// paginação são feitos no browser, sem pedidos ao backend.
export function VehicleInventory({ vehicles }: { vehicles: Vehicle[] }) {
    const [filters, setFilters] = useState<Filters>({});
    const [ordering, setOrdering] = useState<Ordering>("recentes");
    const [visible, setVisible] = useState(PAGE_SIZE);
    // Filtros do telemóvel: só se aplicam ao carregar em "Ver N viaturas"
    const [draft, setDraft] = useState<Filters>({});
    const [sheetOpen, setSheetOpen] = useState(false);

    // Filtros que vêm no endereço (link partilhado, pesquisa da página inicial, botão "voltar")
    useEffect(() => {
        const fromUrl = parseQuery(window.location.search);
        setFilters(fromUrl.filters);
        setOrdering(fromUrl.ordering);
    }, []);

    const update = (nextFilters: Filters, nextOrdering = ordering) => {
        setFilters(nextFilters);
        setOrdering(nextOrdering);
        setVisible(PAGE_SIZE);
        window.history.replaceState(null, "", `${window.location.pathname}${toQuery(nextFilters, nextOrdering)}`);
    };

    const results = useMemo(() => applyFilters(vehicles, filters, ordering), [vehicles, filters, ordering]);
    const draftCount = useMemo(() => applyFilters(vehicles, draft).length, [vehicles, draft]);
    const activeCount = countActive(filters);

    const activeChips = [
        ...FACETS.flatMap(({ key }) => {
            const labels = new Map(facetOptions(vehicles, key).map((o) => [o.value, o.label]));
            return (filters[key] ?? []).map((value) => ({
                id: `${key}-${value}`,
                label: labels.get(value) ?? value,
                remove: () => {
                    const values = filters[key]!.filter((v) => v !== value);
                    const next = { ...filters, [key]: values };
                    if (!values.length) delete next[key];
                    update(next);
                },
            }));
        }),
        ...RANGES.filter(({ key }) => filters[key] !== undefined).map(({ key }) => ({
            id: key,
            label: RANGE_LABEL[key](filters[key]!),
            remove: () => {
                const next = { ...filters };
                delete next[key];
                update(next);
            },
        })),
    ];

    return (
        <main className="bg-neutral-50 pb-16">
            <div className="site-container pt-6 pb-4 md:pt-10">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Carros usados à venda</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {vehicles.length} viaturas em stock em Loures · financiamento até 120 meses
                </p>
            </div>

            {/* Barra fixa por baixo do cabeçalho */}
            <div className="sticky top-14 z-30 border-y bg-white/95 backdrop-blur md:top-16">
                <div className="site-container flex h-14 items-center gap-3">
                    <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (open) setDraft(filters); }}>
                        <SheetTrigger className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium hover:bg-neutral-100 lg:hidden">
                            <SlidersHorizontal className="size-4" /> Filtros
                            {activeCount > 0 && (
                                <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">{activeCount}</span>
                            )}
                        </SheetTrigger>
                        <SheetContent side="bottom" className="max-h-[90dvh] gap-0 rounded-t-2xl p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                            <SheetTitle className="border-b px-5 py-4 text-base">Filtros</SheetTitle>
                            <div className="overflow-y-auto px-5 py-5">
                                <FilterPanel vehicles={vehicles} filters={draft} onChange={setDraft} />
                            </div>
                            <div className="flex gap-3 border-t px-5 py-4">
                                <button type="button" onClick={() => setDraft({})} className="h-12 rounded-lg px-4 text-sm font-medium underline-offset-4 hover:underline">
                                    Limpar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { update(draft); setSheetOpen(false); }}
                                    className="h-12 flex-1 rounded-lg bg-red-600 text-base font-semibold text-white hover:bg-red-700"
                                >
                                    Ver {draftCount} {draftCount === 1 ? "viatura" : "viaturas"}
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <p className="hidden text-sm text-muted-foreground lg:block" aria-live="polite">
                        <strong className="text-foreground">{results.length}</strong> {results.length === 1 ? "viatura" : "viaturas"}
                    </p>

                    <label className="ml-auto flex items-center gap-2 text-sm">
                        <span className="hidden text-muted-foreground sm:inline">Ordenar</span>
                        <select
                            aria-label="Ordenar por"
                            className={`${selectClass} h-10 w-auto rounded-full`}
                            value={ordering}
                            onChange={(e) => update(filters, e.target.value as Ordering)}
                        >
                            {ORDERINGS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </label>
                </div>
            </div>

            <div className="site-container mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
                <aside className="hidden lg:block" aria-label="Filtros">
                    <div className="sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-xl border bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Filtros</h2>
                            {activeCount > 0 && (
                                <button type="button" onClick={() => update({})} className="text-sm text-red-600 hover:underline">
                                    Limpar
                                </button>
                            )}
                        </div>
                        <FilterPanel vehicles={vehicles} filters={filters} onChange={update} />
                    </div>
                </aside>

                <section aria-labelledby="results-heading" className="min-w-0">
                    <h2 id="results-heading" className="sr-only">Resultados</h2>

                    {activeChips.length > 0 && (
                        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
                            {activeChips.map((chip) => (
                                <button
                                    key={chip.id}
                                    type="button"
                                    onClick={chip.remove}
                                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-neutral-900 pl-3 pr-2 text-sm text-white hover:bg-neutral-700"
                                >
                                    {chip.label} <X className="size-4" aria-hidden />
                                    <span className="sr-only">(remover filtro)</span>
                                </button>
                            ))}
                            <button type="button" onClick={() => update({})} className="h-8 shrink-0 px-2 text-sm text-red-600 hover:underline">
                                Limpar tudo
                            </button>
                        </div>
                    )}

                    <p className="mb-3 text-sm text-muted-foreground lg:hidden" aria-live="polite">
                        <strong className="text-foreground">{results.length}</strong> {results.length === 1 ? "viatura encontrada" : "viaturas encontradas"}
                    </p>

                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
                            {results.slice(0, visible).map((vehicle, index) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index === 0} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border bg-white px-6 py-16 text-center">
                            <p className="text-lg font-medium">Nenhuma viatura com estes filtros.</p>
                            <p className="mt-1 text-sm text-muted-foreground">Experimente remover alguns filtros ou contacte-nos.</p>
                            <button type="button" onClick={() => update({})} className="mt-4 rounded-full border px-5 py-2 text-sm font-medium hover:bg-neutral-100">
                                Limpar filtros
                            </button>
                        </div>
                    )}

                    {visible < results.length && (
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <p className="text-sm text-muted-foreground">A ver {visible} de {results.length}</p>
                            <button
                                type="button"
                                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                                className="h-12 w-full max-w-xs rounded-full border-2 border-neutral-900 text-sm font-semibold hover:bg-neutral-900 hover:text-white"
                            >
                                Ver mais viaturas
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
