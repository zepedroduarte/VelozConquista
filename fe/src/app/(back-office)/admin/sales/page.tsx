'use client'

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DollarSign, FileSpreadsheet, Loader2, Pencil, Undo2 } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sale, apiErrorMessage, formatDate, formatEuro, useAdminData } from "@/lib/admin";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const EXPENSES_KEY = "vc-monthly-expenses";

/** Comissão da financeira: clica-se no valor para o alterar (muitas vezes só se sabe depois da venda). */
function CommissionCell({ sale, onSaved, onError }: { sale: Sale; onSaved: (sale: Sale) => void; onError: (msg: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(sale.commission);
    const [saving, setSaving] = useState(false);

    async function save() {
        const next = value.trim() === "" ? "0" : value;
        if (Number(next) === Number(sale.commission)) { setEditing(false); return; }
        setSaving(true);
        try {
            const { data } = await api.patch<Sale>(`/admin/sales/${sale.id}/`, { commission: next });
            onSaved(data);
            setEditing(false);
        } catch (err) {
            onError(apiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    if (editing) {
        return (
            <Input
                autoFocus type="number" inputMode="decimal" min="0" step="0.01" disabled={saving}
                className="h-7 px-2 text-sm" value={value} aria-label="Comissão"
                onChange={(e) => setValue(e.target.value)} onBlur={save}
                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setValue(sale.commission); setEditing(false); } }}
            />
        );
    }
    return (
        <button type="button" onClick={() => { setValue(sale.commission); setEditing(true); }} className="inline-flex items-center gap-1 hover:text-red-600" title="Alterar comissão">
            {formatEuro(sale.commission)} <Pencil className="size-3 text-muted-foreground" />
        </button>
    );
}

export default function SalesPage() {
    const [year, setYear] = useState(currentYear);
    const { data: sales, setData, isLoading, error } = useAdminData<Sale[]>(`/admin/sales/?year=${year}`);
    const [actionError, setActionError] = useState<string | null>(null);
    const [expenses, setExpenses] = useState("2800");
    const [exporting, setExporting] = useState(false);

    // Despesas mensais estimadas: lembradas neste computador
    useEffect(() => {
        try {
            const saved = localStorage.getItem(EXPENSES_KEY);
            if (saved) setExpenses(saved);
        } catch { /* sem localStorage */ }
    }, []);

    async function exportExcel() {
        setActionError(null);
        setExporting(true);
        try {
            try { localStorage.setItem(EXPENSES_KEY, expenses); } catch { /* sem localStorage */ }
            const { data } = await api.get<Blob>("/admin/sales/export/", {
                params: { year, monthly_expenses: expenses || 0 },
                responseType: "blob",
            });
            const url = URL.createObjectURL(data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Vendas ${year}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setActionError("Não foi possível gerar o Excel. Tente novamente.");
        } finally {
            setExporting(false);
        }
    }

    const replaceSale = (updated: Sale) => setData((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? null);

    const totals = useMemo(() => (sales ?? []).reduce(
        (acc, s) => ({ revenue: acc.revenue + Number(s.final_price), profit: acc.profit + Number(s.profit) }),
        { revenue: 0, profit: 0 },
    ), [sales]);

    async function undoSale(id: number) {
        setActionError(null);
        try {
            await api.delete(`/admin/sales/${id}/`);
            setData((prev) => prev?.filter((s) => s.id !== id) ?? null);
        } catch (err) {
            setActionError(apiErrorMessage(err));
        }
    }

    return (
        <div className="p-4 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"><DollarSign className="size-7 text-red-600" /> Registo de Vendas</h1>
                    <p className="text-muted-foreground">As vendas são registadas no botão € da Gestão de Stock.</p>
                </div>
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="h-9 rounded-md border bg-background px-3 text-sm w-full sm:w-auto"
                    aria-label="Ano"
                >
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm py-0"><CardContent className="p-4 sm:p-5"><p className="text-sm text-muted-foreground">Viaturas vendidas</p><p className="text-2xl font-bold">{sales?.length ?? 0}</p></CardContent></Card>
                <Card className="border-none shadow-sm py-0"><CardContent className="p-4 sm:p-5"><p className="text-sm text-muted-foreground">Faturado</p><p className="text-2xl font-bold">{formatEuro(totals.revenue)}</p></CardContent></Card>
                <Card className="border-none shadow-sm py-0"><CardContent className="p-4 sm:p-5"><p className="text-sm text-muted-foreground">Lucro (venda − compra − custos + comissão)</p><p className={`text-2xl font-bold ${totals.profit < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatEuro(totals.profit)}</p></CardContent></Card>
            </div>

            <Card className="border-none shadow-sm py-0">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <p className="font-semibold flex items-center gap-2"><FileSpreadsheet className="size-5 text-green-700" /> Resumo anual em Excel</p>
                        <p className="text-sm text-muted-foreground">Comparação com {year - 1}, totais por mês e uma folha por mês com cada venda.</p>
                    </div>
                    <label className="space-y-1 text-sm sm:w-48">
                        <span className="text-muted-foreground">Despesas fixas por mês (€)</span>
                        <Input type="number" inputMode="decimal" min="0" step="50" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
                    </label>
                    <Button onClick={exportExcel} disabled={exporting} className="bg-green-700 hover:bg-green-800 text-white gap-2">
                        {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />} Exportar {year}
                    </Button>
                </CardContent>
            </Card>

            {actionError && <p className="text-sm text-red-600">{actionError}</p>}

            {isLoading && !sales ? (
                <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-red-600" /></div>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : sales?.length === 0 ? (
                <Card className="border-none shadow-sm py-0"><CardContent className="p-10 text-center text-muted-foreground">Sem vendas registadas em {year}.</CardContent></Card>
            ) : (
                <div className={`space-y-3 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
                    {sales?.map((sale) => (
                        <Card key={sale.id} className="border-none shadow-sm py-0">
                            <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold">{sale.vehicle.make} {sale.vehicle.model} {sale.vehicle.year} <span className="font-mono text-xs text-muted-foreground ml-1">{sale.vehicle.license_plate}</span></p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(sale.created_at)} · {sale.customer ? <Link href="/admin/customers" className="underline-offset-2 hover:underline">{sale.customer.name}</Link> : "Sem cliente associado"}
                                    </p>
                                    {sale.notes && <p className="text-xs text-muted-foreground mt-1">{sale.notes}</p>}
                                </div>
                                <dl className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-3 text-sm lg:w-[480px] shrink-0">
                                    <div><dt className="text-xs text-muted-foreground">Compra</dt><dd>{formatEuro(sale.vehicle.purchase_price)}</dd></div>
                                    <div><dt className="text-xs text-muted-foreground">Custos</dt><dd>{formatEuro(sale.services_total)}</dd></div>
                                    <div><dt className="text-xs text-muted-foreground">Venda</dt><dd className="font-semibold">{formatEuro(sale.final_price)}</dd></div>
                                    <div><dt className="text-xs text-muted-foreground">Comissão</dt><dd><CommissionCell sale={sale} onSaved={replaceSale} onError={setActionError} /></dd></div>
                                    <div><dt className="text-xs text-muted-foreground">Lucro</dt><dd className={`font-bold ${Number(sale.profit) < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatEuro(sale.profit)}</dd></div>
                                </dl>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground self-start lg:self-center"><Undo2 className="size-4" /> Anular</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Anular esta venda?</AlertDialogTitle>
                                            <AlertDialogDescription>O registo da venda é apagado e o {sale.vehicle.make} {sale.vehicle.model} volta a ficar &quot;Disponível&quot; no site. O cliente não é apagado.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => undoSale(sale.id)} className="bg-red-600 hover:bg-red-700 text-white">Anular venda</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
