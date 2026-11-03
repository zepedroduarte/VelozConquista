'use client'

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Customer, apiErrorMessage, formatDate, useAdminData } from "@/lib/admin";

type CustomerForm = Pick<Customer, "name" | "phone" | "email" | "nif" | "address" | "notes">;
const EMPTY: CustomerForm = { name: "", phone: "", email: "", nif: "", address: "", notes: "" };

function CustomerEditor({ initial, onSave, onCancel }: { initial: CustomerForm; onSave: (values: CustomerForm) => Promise<void>; onCancel: () => void }) {
    const [values, setValues] = useState(initial);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = (key: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues({ ...values, [key]: e.target.value });

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!values.name.trim()) { setError("O nome é obrigatório."); return; }
        setIsSaving(true);
        setError(null);
        try {
            await onSave(values);
        } catch (err) {
            setError(apiErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="space-y-1.5"><Label>Nome</Label><Input value={values.name} onChange={set("name")} autoFocus /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input type="tel" value={values.phone} onChange={set("phone")} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={values.email} onChange={set("email")} /></div>
            <div className="space-y-1.5"><Label>NIF</Label><Input inputMode="numeric" value={values.nif} onChange={set("nif")} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Morada</Label><Input value={values.address} onChange={set("address")} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Notas</Label><Textarea rows={3} value={values.notes} onChange={set("notes")} /></div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">{isSaving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}</Button>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </form>
    );
}

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: customers, setData, isLoading, error } = useAdminData<Customer[]>(
        `/admin/customers/${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""}`,
    );

    async function create(values: CustomerForm) {
        const { data } = await api.post<Customer>("/admin/customers/", values);
        setData((prev) => [data, ...(prev ?? [])]);
        setEditingId(null);
    }

    async function update(id: number, values: CustomerForm) {
        const { data } = await api.patch<Customer>(`/admin/customers/${id}/`, values);
        setData((prev) => prev?.map((c) => (c.id === id ? { ...data, purchases_count: c.purchases_count } : c)) ?? null);
        setEditingId(null);
    }

    async function remove(customer: Customer) {
        const warning = customer.purchases_count > 0 ? " As vendas associadas mantêm-se, mas ficam sem cliente." : "";
        if (!window.confirm(`Apagar ${customer.name}?${warning}`)) return;
        setActionError(null);
        try {
            await api.delete(`/admin/customers/${customer.id}/`);
            setData((prev) => prev?.filter((c) => c.id !== customer.id) ?? null);
        } catch (err) {
            setActionError(apiErrorMessage(err));
        }
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="size-7 text-red-600" /> Clientes</h1>
                    <p className="text-muted-foreground">Os clientes também são criados automaticamente ao registar uma venda.</p>
                </div>
                <Button onClick={() => setEditingId("new")} className="bg-red-600 hover:bg-red-700 text-white gap-1"><Plus className="size-4" /> Novo cliente</Button>
            </div>

            {editingId === "new" && (
                <Card className="border-none shadow-sm py-0"><CardContent className="p-4 sm:p-5">
                    <h2 className="font-semibold">Novo cliente</h2>
                    <CustomerEditor initial={EMPTY} onSave={create} onCancel={() => setEditingId(null)} />
                </CardContent></Card>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input className="pl-9 bg-background" placeholder="Pesquisar por nome, telefone, email ou NIF..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {actionError && <p className="text-sm text-red-600">{actionError}</p>}

            {isLoading && !customers ? (
                <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-red-600" /></div>
            ) : error ? <p className="text-red-600">{error}</p> : customers?.length === 0 ? (
                <Card className="border-none shadow-sm py-0"><CardContent className="p-10 text-center text-muted-foreground">Nenhum cliente encontrado.</CardContent></Card>
            ) : (
                <div className={`space-y-3 transition-opacity ${isLoading ? "opacity-50" : ""}`}>
                    {customers?.map((c) => (
                        <Card key={c.id} className="border-none shadow-sm py-0">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold">{c.name} {c.purchases_count > 0 && <span className="ml-2 text-xs font-medium rounded-full bg-green-100 text-green-800 px-2 py-0.5">{c.purchases_count} compra{c.purchases_count > 1 ? "s" : ""}</span>}</p>
                                        <p className="text-sm text-muted-foreground">{[c.nif && `NIF ${c.nif}`, `desde ${formatDate(c.created_at)}`].filter(Boolean).join(" · ")}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {c.phone && <Button asChild variant="outline" size="sm" className="gap-1"><a href={`tel:${c.phone}`}><Phone className="size-4" /> {c.phone}</a></Button>}
                                        {c.email && <Button asChild variant="outline" size="sm" className="gap-1"><a href={`mailto:${c.email}`}><Mail className="size-4" /> Email</a></Button>}
                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(editingId === c.id ? null : c.id)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => remove(c)} aria-label={`Apagar ${c.name}`}><Trash2 className="size-4 text-red-600" /></Button>
                                    </div>
                                </div>
                                {editingId === c.id && <CustomerEditor initial={c} onSave={(v) => update(c.id, v)} onCancel={() => setEditingId(null)} />}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
