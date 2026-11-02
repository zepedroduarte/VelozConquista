'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import api from '@/lib/axios';
import { VehicleOptions } from '@/lib/types';

export type Option = { id: number; name: string };

interface VehicleOptionsContextType extends VehicleOptions {
    refreshOptions: () => Promise<void>;
}

const emptyOptions: VehicleOptions = {
    bodyStyle: [],
    fuelType: [],
    transmissionType: [],
    tractionType: [],
    status: [],
};

const VehicleOptionsContext = createContext<VehicleOptionsContextType | undefined>(undefined);

// initialOptions vem do servidor (ISR). Só vamos buscar ao browser se o servidor não conseguiu.
export function VehicleOptionsProvider({ children, initialOptions = null }: { children: ReactNode, initialOptions?: VehicleOptions | null }) {
    const [options, setOptions] = useState<VehicleOptions>(initialOptions ?? emptyOptions);

    const fetchOptions = useCallback(async () => {
        try {
            const response = await api.get('/vehicle-attributes/');
            setOptions({
                bodyStyle: response.data.body_style,
                fuelType: response.data.fuel_type,
                transmissionType: response.data.transmission_type,
                tractionType: response.data.traction_type,
                status: response.data.status,
            });
        } catch (error) {
            console.error("Erro ao carregar opções de veículos:", error);
        }
    }, []);

    useEffect(() => {
        if (!initialOptions) fetchOptions();
    }, [initialOptions, fetchOptions]);

    return (
        <VehicleOptionsContext.Provider value={{ ...options, refreshOptions: fetchOptions }}>
            {children}
        </VehicleOptionsContext.Provider>
    );
}

export function useVehicleOptions() {
    const context = useContext(VehicleOptionsContext);
    if (context === undefined) {
        throw new Error('useVehicleOptions deve ser usado dentro de um VehicleOptionsProvider');
    }
    return context;
}
