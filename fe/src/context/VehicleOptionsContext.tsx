'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/axios';

export type Option = { id: number; name: string };

interface VehicleOptions {
    bodyStyle: Option[];
    fuelType: Option[];
    transmissionType: Option[];
    tractionType: Option[];
    status: Option[];
}

interface VehicleOptionsContextType extends VehicleOptions {
    refreshOptions: () => Promise<void>;
}

const VehicleOptionsContext = createContext<VehicleOptionsContextType | undefined>(undefined);

export function VehicleOptionsProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<VehicleOptions>({
        bodyStyle: [],
        fuelType: [],
        transmissionType: [],
        tractionType: [],
        status: [],
    });

    const fetchOptions = async () => {
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
    };

    useEffect(() => {
        fetchOptions();
    }, []);

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