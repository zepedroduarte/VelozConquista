'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/axios";

export interface VehicleSummary {
    id: number;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    purchase_price: string;
    retail_price: string;
    status: string;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    nif: string;
    notes: string;
    purchases_count: number;
    created_at: string;
}

export interface Sale {
    id: number;
    vehicle: VehicleSummary;
    customer: Customer | null;
    final_price: string;
    commission: string;
    notes: string;
    services_total: string;
    profit: string;
    created_at: string;
}

export interface VehicleServiceCost {
    id: number;
    vehicle: number;
    vehicle_summary: VehicleSummary;
    description: string;
    price: string;
    person: string | null;
    created_at: string;
}

export interface AdminMessage {
    id: number;
    sender_name: string;
    sender_email: string;
    sender_phone_number: string | null;
    subject: string;
    body: string;
    vehicle: number | null;
    vehicle_title: string | null;
    is_read: boolean;
    created_at: string;
}

export interface DashboardData {
    stock_count: number;
    stock_value: number;
    stock_cost: number;
    sales_this_month: number;
    revenue_this_month: number;
    profit_this_month: number;
    unread_messages: number;
    insurance: { policy_number: string; valid_until: string; days_left: number } | null;
    oldest_in_stock: (VehicleSummary & { days_in_stock: number })[];
}

/** Carrega um endpoint do back-office; `reload()` volta a pedir. Pedidos antigos são cancelados. */
export function useAdminData<T>(url: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const reload = useCallback(async () => {
        if (!url) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        try {
            const response = await api.get<T>(url, { signal: controller.signal });
            setData(response.data);
            setError(null);
        } catch (err) {
            if (controller.signal.aborted) return;
            setError(apiErrorMessage(err));
        } finally {
            if (abortRef.current === controller) setIsLoading(false);
        }
    }, [url]);

    useEffect(() => {
        reload();
        return () => abortRef.current?.abort();
    }, [reload]);

    return { data, setData, isLoading, error, reload };
}

/** Mensagem de erro legível a partir de uma resposta do Django/DRF. */
export function apiErrorMessage(err: unknown): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (data && typeof data === "object") {
            if ("error" in data) return String(data.error);
            const first = Object.values(data)[0];
            if (Array.isArray(first)) return String(first[0]);
            if (typeof first === "string") return first;
        }
        if (!err.response) return "Sem ligação ao servidor. Tente novamente.";
    }
    return "Ocorreu um erro. Tente novamente.";
}

export function formatEuro(value: string | number): string {
    return Number(value).toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("pt-PT");
}
