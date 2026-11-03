'use client'

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus, Trash2, Wrench } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/schemas/Vehicle";
import { VehicleServiceCost, apiErrorMessage, formatDate, formatEuro, useAdminData } from "@/lib/admin";

const selectClass = "h-9 w-full rounded-md border bg-background px-3 text-sm";

function ServicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleFilter = searchParams.get("vehicle") ?? "";

    const { data: vehiclePage } = useAdminData<{ results: Vehicle[] }>("/admin/vehicles/?page_size=500");
    const vehicles = vehiclePage?.results ?? [];

    const { data: services, setData, isLoading, error } = useAdminData<VehicleServiceCost[]>(
        `/admin/services/${vehicleFilter ? `?vehicle=${vehicleFilter}` : ""}`,
    );

    const [form, setForm] = useState({ vehicle: vehicleFilter, description: "", price: "", person: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const total = useMemo(() => (services ?? []).reduce((acc, s) => acc + Number(s.price), 0), [services]);

    const setFilter = (vehicleId: string) => {
        router.replace(vehicleId ? `/admin/services?vehicle=${vehicleId}` : "/admin/services");
        setForm((f) => ({ ...f, vehicle: vehicleId }));
    };

    async function addService(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        if (!form.vehicle || !form.description || !form.price) {
            setFormError("Escolha a viatura e preencha a descrição e o valor.");
            return;
        }
        setIsSaving(true);
        try {
            const { data } = await api.post<VehicleServiceCost>("/admin/services/", { ...form, person: form.person || null });
            setData((prev) => [data, ...(prev ?? [])]);
            setForm((f) => ({ ...f, description: "", price: "", person: "" }));
        } catch (err) {
            setFormError(apiErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }

    async function removeService(id: number) {
        if (!window.confirm("Apagar este custo?")) return;
        try {
            await api.delete(`/admin/services/${id}/`);
            setData((prev) => prev?.filter((s) => s.id !== id) ?? null);
        } catch (err) {
            setFormError(apiErrorMessage(err));
        }
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"><Wrench className="size-7 text-red-600" /> Custos / Oficina</h1>
                <p className="text-muted-foreground">Reparações, inspeções, pneus, limpezas... Entram no cálculo do lucro de cada venda.</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-lg">Registar custo</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-4 space-y-1.5">
                            <Label htmlFor="vehicle">Viatura</Label>
                            <select id="vehicle" className={selectClass} value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                                <option value="">Escolha...</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.vehicle_data.make} {v.vehicle_data.model} · {v.vehicle_data.license_plate}{v.status.name === "Vendido" ? " (vendido)" : ""}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-4 space-y-1.5">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" placeholder="Ex.: Inspeção + pastilhas" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="price">Valor (€)</Label>
                            <Input id="price" type="number" step="0.01" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="person">Oficina / Pessoa</Label>
                            <Input id="person" value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} />
                        </div>
                        <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center gap-3">
                            <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white gap-1">
                                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Adicionar custo
                            </Button>
                            {formError && <p className="text-sm text-red-600">{formError}</p>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-lg">Histórico <span className="text-muted-foreground font-normal text-sm">· total {formatEuro(total)}</span></CardTitle>
                    <select className={`${selectClass} sm:w-72`} value={vehicleFilter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar por viatura">
                        <option value="">Todas as viaturas</option>
                        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_data.make} {v.vehicle_data.model} · {v.vehicle_data.license_plate}</option>)}
                    </select>
                </CardHeader>
                <CardContent>
                    {isLoading && !services ? <Loader2 className="size-6 animate-spin text-red-600" /> : error ? <p className="text-red-600">{error}</p> : services?.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">Sem custos registados.</p>
                    ) : (
                        <ul className="divide-y">
                            {services?.map((s) => (
                                <li key={s.id} className="flex items-center gap-3 py-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{s.description}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {s.vehicle_summary.make} {s.vehicle_summary.model} · {s.vehicle_summary.license_plate} · {formatDate(s.created_at)}{s.person ? ` · ${s.person}` : ""}
                                        </p>
                                    </div>
                                    <span className="font-semibold shrink-0">{formatEuro(s.price)}</span>
                                    <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => removeService(s.id)} aria-label="Apagar custo"><Trash2 className="size-4 text-red-600" /></Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="size-6 animate-spin text-red-600" /></div>}>
            <ServicesContent />
        </Suspense>
    );
}
