'use client'

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Check, FileText, ListChecks, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage, useAdminData } from "@/lib/admin";
import { CompanySettings, LegalInfo } from "@/lib/types";
import { useVehicleOptions } from "@/context/VehicleOptionsContext";

const TABS = [
    { id: "company", label: "Empresa", icon: Building2 },
    { id: "legal", label: "Sobre & Seguro", icon: FileText },
    { id: "options", label: "Opções das viaturas", icon: ListChecks },
] as const;

type TabId = typeof TABS[number]["id"];

// --- Formulário genérico para os singletons (Empresa / Informação legal) ---

type FieldDef<T> = { name: keyof T & string; label: string; type?: "text" | "email" | "url" | "date" | "textarea"; hint?: string; full?: boolean };

function SettingsForm<T extends object>({ url, fields, description }: { url: string; fields: FieldDef<T>[]; description?: React.ReactNode }) {
    const { data, isLoading, error: loadError } = useAdminData<T>(url);
    const [values, setValues] = useState<Partial<T>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        if (data) setValues(data);
    }, [data]);

    const setValue = (name: string, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setFeedback(null);
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setFeedback(null);
        try {
            const response = await api.patch<T>(url, values);
            setValues(response.data);
            setFeedback({ ok: true, text: "Guardado. O site público é atualizado em poucos segundos." });
        } catch (err) {
            setFeedback({ ok: false, text: apiErrorMessage(err) });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading && !data) return <div className="py-10 flex justify-center"><Loader2 className="size-6 animate-spin text-red-600" /></div>;
    if (loadError) return <p className="text-red-600">{loadError}</p>;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {description}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => {
                    const value = String((values as Record<string, unknown>)[field.name] ?? "");
                    return (
                        <div key={field.name} className={`space-y-1.5 ${field.full || field.type === "textarea" ? "md:col-span-2" : ""}`}>
                            <Label htmlFor={field.name}>{field.label}</Label>
                            {field.type === "textarea" ? (
                                <Textarea id={field.name} rows={5} value={value} onChange={(e) => setValue(field.name, e.target.value)} />
                            ) : (
                                <Input id={field.name} type={field.type ?? "text"} value={value} onChange={(e) => setValue(field.name, e.target.value)} />
                            )}
                            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                    {isSaving ? <><Loader2 className="mr-2 size-4 animate-spin" /> A guardar...</> : "Guardar alterações"}
                </Button>
                {feedback && <p className={`text-sm ${feedback.ok ? "text-green-700" : "text-red-600"}`}>{feedback.text}</p>}
            </div>
        </form>
    );
}

const COMPANY_FIELDS: FieldDef<CompanySettings>[] = [
    { name: "name", label: "Nome do stand" },
    { name: "phone", label: "Telefone" },
    { name: "email", label: "Email (recebe as mensagens do site)", type: "email" },
    { name: "whatsapp_number", label: "WhatsApp", hint: "Com indicativo, ex.: 351912345678" },
    { name: "address", label: "Morada completa", full: true, hint: "Escreva-a exatamente como no Google Business Profile." },
    { name: "postal_code", label: "Código postal", hint: "Ex.: 2670-351" },
    { name: "locality", label: "Localidade", hint: "Usada nos títulos do Google, ex.: \"Carros usados em Loures\"." },
    { name: "weekday_hours", label: "Horário segunda a sexta", hint: "Ex.: 09:00-19:00 ou 09:00-13:00, 14:30-19:00" },
    { name: "saturday_hours", label: "Horário sábado", hint: "Vazio = fechado" },
    { name: "sunday_hours", label: "Horário domingo", hint: "Vazio = fechado" },
    { name: "google_maps_url", label: "Link do Google Maps", type: "url", hint: "No Google Maps: Partilhar → Copiar link." },
    { name: "latitude", label: "Latitude", hint: "No Google Maps, clique com o botão direito no stand e copie o 1.º número." },
    { name: "longitude", label: "Longitude", hint: "O 2.º número (negativo, ex.: -9.19...)." },
    { name: "instagram_url", label: "Instagram (link)", type: "url" },
    { name: "facebook_url", label: "Facebook (link)", type: "url" },
    { name: "service_areas", label: "Zonas servidas", type: "textarea", hint: "Uma localidade por linha. Aparece no rodapé e nas perguntas frequentes." },
    { name: "description", label: "Texto da página \"Sobre Nós\"", type: "textarea", hint: "Cada linha é um parágrafo." },
];

const LEGAL_FIELDS: FieldDef<LegalInfo>[] = [
    { name: "insurance_policy_number", label: "N.º da apólice" },
    { name: "insurer", label: "Seguradora" },
    { name: "insurance_valid_from", label: "Válida de", type: "date" },
    { name: "insurance_valid_until", label: "Válida até", type: "date" },
    { name: "legal_name", label: "Denominação social" },
    { name: "credit_intermediary_number", label: "N.º de registo (Banco de Portugal)" },
    { name: "lenders", label: "Mutuantes com contrato de vinculação", type: "textarea", hint: "Um por linha." },
    { name: "services", label: "Serviços de intermediação de crédito", type: "textarea", hint: "Um por linha." },
];

// --- Listas de opções (combustível, caixa, ...) ---

type Option = { id: number; name: string };

function OptionList({ title, endpoint, onChanged }: { title: string; endpoint: string; onChanged: () => void }) {
    const url = `/admin/attributes/${endpoint}/`;
    const { data: options, setData, isLoading } = useAdminData<Option[]>(url);
    const [newName, setNewName] = useState("");
    const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function run(action: () => Promise<void>) {
        setError(null);
        try {
            await action();
            onChanged();
        } catch (err) {
            setError(apiErrorMessage(err));
        }
    }

    const add = () => run(async () => {
        if (!newName.trim()) return;
        const { data } = await api.post<Option>(url, { name: newName.trim() });
        setData((prev) => [...(prev ?? []), data]);
        setNewName("");
    });

    const save = () => run(async () => {
        if (!editing) return;
        const { data } = await api.patch<Option>(`${url}${editing.id}/`, { name: editing.name });
        setData((prev) => prev?.map((o) => (o.id === data.id ? data : o)) ?? null);
        setEditing(null);
    });

    const remove = (id: number) => run(async () => {
        await api.delete(`${url}${id}/`);
        setData((prev) => prev?.filter((o) => o.id !== id) ?? null);
    });

    return (
        <Card className="border shadow-none">
            <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {isLoading && !options ? <Loader2 className="size-4 animate-spin" /> : (
                    <ul className="divide-y">
                        {options?.map((option) => (
                            <li key={option.id} className="flex items-center gap-2 py-1.5">
                                {editing?.id === option.id ? (
                                    <>
                                        <Input className="h-8" value={editing.name} autoFocus onChange={(e) => setEditing({ ...editing, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && save()} />
                                        <Button size="icon" variant="ghost" className="size-8" onClick={save} aria-label="Guardar"><Check className="size-4 text-green-600" /></Button>
                                        <Button size="icon" variant="ghost" className="size-8" onClick={() => setEditing(null)} aria-label="Cancelar"><X className="size-4" /></Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm">{option.name}</span>
                                        <Button size="icon" variant="ghost" className="size-8" onClick={() => setEditing(option)} aria-label={`Editar ${option.name}`}><Pencil className="size-4" /></Button>
                                        <Button size="icon" variant="ghost" className="size-8" onClick={() => remove(option.id)} aria-label={`Apagar ${option.name}`}><Trash2 className="size-4 text-red-600" /></Button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex gap-2">
                    <Input className="h-9" placeholder="Nova opção" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
                    <Button size="sm" variant="outline" onClick={add} className="gap-1"><Plus className="size-4" /> Adicionar</Button>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
            </CardContent>
        </Card>
    );
}

function VehicleOptionsTab() {
    const { refreshOptions } = useVehicleOptions();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionList title="Combustível" endpoint="fuel-types" onChanged={refreshOptions} />
            <OptionList title="Caixa" endpoint="transmission-types" onChanged={refreshOptions} />
            <OptionList title="Segmento / Carroçaria" endpoint="body-styles" onChanged={refreshOptions} />
            <OptionList title="Tração" endpoint="traction-types" onChanged={refreshOptions} />
        </div>
    );
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const requested = searchParams.get("tab");
    const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : "company";

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Definições do Site</h1>
                <p className="text-muted-foreground">Conteúdos mostrados no site público.</p>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => router.replace(`/admin/settings?tab=${t.id}`)}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-red-600 text-red-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        <t.icon className="size-4" /> {t.label}
                    </button>
                ))}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>{TABS.find((t) => t.id === tab)?.label}</CardTitle>
                    {tab === "legal" && <CardDescription>Informação obrigatória de intermediário de crédito, mostrada na página &quot;Sobre Nós&quot;. Atualize a apólice sempre que a renovar.</CardDescription>}
                    {tab === "options" && <CardDescription>Opções disponíveis nos filtros do site e no formulário das viaturas. Só pode apagar opções que nenhuma viatura esteja a usar.</CardDescription>}
                </CardHeader>
                <CardContent>
                    {tab === "company" && <SettingsForm<CompanySettings> url="/admin/settings/company/" fields={COMPANY_FIELDS} />}
                    {tab === "legal" && <SettingsForm<LegalInfo> url="/admin/settings/legal/" fields={LEGAL_FIELDS} />}
                    {tab === "options" && <VehicleOptionsTab />}
                </CardContent>
            </Card>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="size-6 animate-spin text-red-600" /></div>}>
            <SettingsContent />
        </Suspense>
    );
}
