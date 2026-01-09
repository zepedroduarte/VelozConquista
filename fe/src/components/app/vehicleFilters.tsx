// components/app/vehicleFilters.tsx
'use client'

import { useState } from "react";
import { useVehicleOptions } from "@/context/VehicleOptionsContext";
import { FilterAccordion } from "./FilterAccordion";
import { Card, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export interface SelectedFilters {
    bodyStyle: number[];
    fuelType: number[];
    transmissionType: number[];
    tractionType: number[];
    minPrice?: string;
    maxPrice?: string;
}

export default function VehicleFilters({ onFilterChange }: { onFilterChange?: (filters: SelectedFilters) => void }) {
    const { bodyStyle, fuelType, transmissionType, tractionType } = useVehicleOptions();
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [selected, setSelected] = useState<Omit<SelectedFilters, 'minPrice' | 'maxPrice'>>({
        bodyStyle: [], 
        fuelType: [], 
        transmissionType: [], 
        tractionType: []
    });

    const handleToggle = (category: keyof typeof selected, id: number) => {
        setSelected((prev) => {
            const currentList = prev[category];
            const newList = currentList.includes(id)
                ? currentList.filter((item) => item !== id)
                : [...currentList, id];

            return { ...prev, [category]: newList };
        });
    };

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange({
                ...selected,    
                minPrice,       
                maxPrice        
            });
        }
    };

    const clearFilters = () => {
        const emptyState = { bodyStyle: [], fuelType: [], transmissionType: [], tractionType: [] };
        setSelected(emptyState);
        setMinPrice("");
        setMaxPrice("");
        if (onFilterChange) onFilterChange({ ...emptyState, minPrice: "", maxPrice: "" });
    };

    return (
        <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorias</span>
                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline hover:cursor-pointer">
                    Limpar
                </button>
            </div>

            <Card className="border shadow-sm p-5">
                <CardTitle className="text-sm font-bold pb-2">Preço (€)</CardTitle>
                <div className="flex gap-3">
                    <Input 
                        type="number" 
                        placeholder="Min" 
                        className="bg-gray-50/50"
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                    />
                    <Input 
                        type="number" 
                        placeholder="Max" 
                        className="bg-gray-50/50"
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                    />
                </div>
            </Card>

            <FilterAccordion title="Combustível" valueKey="fuel" options={fuelType} selectedValues={selected.fuelType} onToggle={(id) => handleToggle('fuelType', id)} />
            <FilterAccordion title="Caixa" valueKey="trans" options={transmissionType} selectedValues={selected.transmissionType} onToggle={(id) => handleToggle('transmissionType', id)} />
            <FilterAccordion title="Carroçaria" valueKey="body" options={bodyStyle} selectedValues={selected.bodyStyle} onToggle={(id) => handleToggle('bodyStyle', id)} />
            <FilterAccordion title="Tração" valueKey="trac" options={tractionType} selectedValues={selected.tractionType} onToggle={(id) => handleToggle('tractionType', id)} />
        
            <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm"
                onClick={handleApply}
            >
                Aplicar Filtros
            </Button>
            
        </div>
    );
}