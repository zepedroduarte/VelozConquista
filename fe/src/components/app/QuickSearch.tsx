'use client'

// Pesquisa rápida da página inicial: marca + preço máximo, com o nº de resultados
// ao vivo. Leva para /veiculos com os filtros no endereço.
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { selectClass } from "@/components/app/FilterPanel";
import { PRICE_STEPS, toQuery } from "@/lib/inventory";
import { formatPrice } from "@/lib/vehicle";

interface QuickSearchProps {
    makes: { value: string; label: string }[];
    /** Uma entrada por viatura: marca (slug) e preço */
    stock: { make: string; price: number }[];
}

export function QuickSearch({ makes, stock }: QuickSearchProps) {
    const [make, setMake] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const count = stock.filter((v) => (!make || v.make === make) && (!maxPrice || v.price <= Number(maxPrice))).length;
    const href = `/veiculos${toQuery({
        ...(make && { marca: [make] }),
        ...(maxPrice && { preco_max: Number(maxPrice) }),
    })}`;

    return (
        <div className="rounded-2xl bg-white p-4 text-foreground shadow-xl sm:p-5">
            <p className="mb-3 font-semibold">Encontre o seu próximo carro</p>
            <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Marca</span>
                    <select className={selectClass} value={make} onChange={(e) => setMake(e.target.value)}>
                        <option value="">Todas</option>
                        {makes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </label>
                <label className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Preço até</span>
                    <select className={selectClass} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                        <option value="">Qualquer</option>
                        {PRICE_STEPS.map((n) => <option key={n} value={n}>{formatPrice(n)}</option>)}
                    </select>
                </label>
            </div>
            <Link
                href={href}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-base font-semibold text-white hover:bg-red-700"
            >
                <Search className="size-5" aria-hidden /> Ver {count} {count === 1 ? "viatura" : "viaturas"}
            </Link>
        </div>
    );
}
