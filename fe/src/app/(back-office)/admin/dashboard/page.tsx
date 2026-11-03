'use client'

import Link from "next/link";
import { AlertTriangle, Car, Clock, Euro, Loader2, MessageSquare, ShieldCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardData, formatDate, formatEuro, useAdminData } from "@/lib/admin";

const INSURANCE_WARNING_DAYS = 21;

function StatCard({ icon: Icon, label, value, hint, href }: { icon: typeof Car, label: string, value: string | number, hint?: string, href?: string }) {
    const content = (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow py-0">
            <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-red-50 text-red-600"><Icon className="size-5" /></div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

function InsuranceAlert({ insurance }: { insurance: NonNullable<DashboardData["insurance"]> }) {
    const { days_left, valid_until, policy_number } = insurance;

    if (days_left > INSURANCE_WARNING_DAYS) {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <ShieldCheck className="size-5 shrink-0" />
                <span>Apólice {policy_number} válida até <strong>{formatDate(valid_until)}</strong> ({days_left} dias).</span>
            </div>
        );
    }

    const expired = days_left < 0;
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border px-4 py-3 text-sm ${expired ? 'border-red-300 bg-red-50 text-red-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
            <AlertTriangle className="size-5 shrink-0" />
            <span className="flex-1">
                {expired
                    ? <>A apólice de seguro mostrada no site <strong>expirou há {Math.abs(days_left)} dias</strong> ({formatDate(valid_until)}). É informação legal obrigatória.</>
                    : <>A apólice de seguro expira em <strong>{days_left} dias</strong> ({formatDate(valid_until)}).</>}
            </span>
            <Link href="/admin/settings?tab=legal">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">Atualizar apólice</Button>
            </Link>
        </div>
    );
}

export default function AdminDashboard() {
    const { data, isLoading, error } = useAdminData<DashboardData>('/admin/dashboard/');

    if (isLoading && !data) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
    }

    if (!data) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    const potentialMargin = Number(data.stock_value) - Number(data.stock_cost);

    return (
        <div className="p-4 sm:p-8 space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Resumo do stand.</p>
            </div>

            {data.insurance && <InsuranceAlert insurance={data.insurance} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Car} label="Viaturas em stock" value={data.stock_count} hint={`${formatEuro(data.stock_value)} em preço de venda`} href="/admin/vehicles" />
                <StatCard icon={Euro} label="Vendas este mês" value={data.sales_this_month} hint={`${formatEuro(data.revenue_this_month)} faturados`} href="/admin/sales" />
                <StatCard icon={TrendingUp} label="Lucro este mês" value={formatEuro(data.profit_this_month)} hint={`Margem potencial do stock: ${formatEuro(potentialMargin)}`} />
                <StatCard icon={MessageSquare} label="Mensagens por ler" value={data.unread_messages} href="/admin/messages" />
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Clock className="size-5 text-red-600" /> Há mais tempo em stock</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.oldest_in_stock.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sem viaturas em stock.</p>
                    ) : (
                        <ul className="divide-y">
                            {data.oldest_in_stock.map((v) => (
                                <li key={v.id}>
                                    <Link href={`/admin/vehicles/${v.id}/edit`} className="flex items-center justify-between gap-4 py-3 hover:bg-muted/50 -mx-2 px-2 rounded">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{v.make} {v.model} {v.year}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{v.license_plate}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold">{formatEuro(v.retail_price)}</p>
                                            <p className={`text-xs ${v.days_in_stock > 90 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>{v.days_in_stock} dias</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
