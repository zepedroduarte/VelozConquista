'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/axios';
import { CompanySettings } from '@/lib/types';

interface CompanyContextType {
    company: CompanySettings | null;
    isLoading: boolean;
}

const defaultSettings: CompanySettings = {
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
};

const CompanyContext = createContext<CompanyContextType>({
    company: defaultSettings,
    isLoading: true
});

// initialCompany vem do servidor (ISR). Só vamos buscar ao browser se o servidor não conseguiu.
export function CompanyProvider({ children, initialCompany = null }: { children: ReactNode, initialCompany?: CompanySettings | null }) {
    const [company, setCompany] = useState<CompanySettings | null>(initialCompany);
    const [isLoading, setIsLoading] = useState(!initialCompany);

    useEffect(() => {
        if (initialCompany) return;

        async function fetchSettings() {
            try {
                const response = await api.get('/company-settings/');
                setCompany(response.data);
            } catch (error) {
                console.error("Erro ao carregar definições da empresa:", error);
                setCompany(defaultSettings);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, [initialCompany]);

    return (
        <CompanyContext.Provider value={{ company, isLoading }}>
            {children}
        </CompanyContext.Provider>
    );
}

// Hook personalizado para usar fácil
export const useCompany = () => useContext(CompanyContext);
