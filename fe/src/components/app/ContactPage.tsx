'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { openingHoursRows, telHref, whatsappHref } from "@/lib/seo";
import { CompanySettings } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ContactVehicle {
    id: number;
    title: string;
}

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

// Formulário de contacto com validação nativa do browser e fetch simples:
// sem axios, react-hook-form nem zod, para a página carregar depressa no telemóvel.
// Vindo de uma viatura (/contacto?viatura=20), o assunto e a mensagem já vêm escritos.
export function ContactPage({ company, vehicles }: { company: CompanySettings | null; vehicles: ContactVehicle[] }) {
    const [values, setValues] = useState(EMPTY);
    const [vehicle, setVehicle] = useState<ContactVehicle | null>(null);
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
    const [sendError, setSendError] = useState<string | null>(null);
    // Honeypot: campo escondido que só robôs de spam preenchem
    const [website, setWebsite] = useState("");

    useEffect(() => {
        const id = Number(new URLSearchParams(window.location.search).get("viatura"));
        const found = vehicles.find((v) => v.id === id);
        if (!found) return;
        setVehicle(found);
        setValues((prev) => ({
            ...prev,
            subject: `Pedido de informação: ${found.title}`,
            message: `Olá! Tenho interesse no ${found.title}. Ainda está disponível?`,
        }));
    }, [vehicles]);

    const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((prev) => ({ ...prev, [field]: e.target.value }));

    function removeVehicle() {
        setVehicle(null);
        setValues((prev) => ({ ...prev, subject: "", message: "" }));
        window.history.replaceState(null, "", window.location.pathname);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSendError(null);
        setStatus("sending");
        try {
            const res = await fetch(`${API_URL}/api/messages/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    website,
                    sender_name: values.name.trim(),
                    sender_email: values.email.trim(),
                    sender_phone_number: values.phone.replace(/[^\d+]/g, "") || null,
                    subject: values.subject.trim(),
                    body: values.message.trim(),
                    vehicle: vehicle?.id ?? null,
                }),
            });
            if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
            setStatus("sent");
            setValues(EMPTY);
            setVehicle(null);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            setStatus("idle");
            setSendError((error as { status?: number }).status === 429
                ? "Foram enviadas demasiadas mensagens. Tente mais tarde ou contacte-nos por telefone."
                : "Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por telefone.");
        }
    }

    const whatsapp = company?.whatsapp_number || company?.phone;

    return (
        <main className="py-8 md:py-14">
            <div className="site-container">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contactos</h1>
                <p className="mt-2 text-muted-foreground">Ligue, envie mensagem ou visite-nos no stand. Respondemos no próprio dia.</p>

                <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
                    {/* No telemóvel o formulário aparece primeiro */}
                    <div className="order-2 space-y-6 lg:order-1">
                        <div className="grid grid-cols-2 gap-3">
                            {company?.phone && (
                                <a href={telHref(company.phone)} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700">
                                    <Phone className="size-5" aria-hidden /> Ligar
                                </a>
                            )}
                            {whatsapp && (
                                <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-green-700 font-semibold text-white hover:bg-green-800">
                                    <MessageCircle className="size-5" aria-hidden /> WhatsApp
                                </a>
                            )}
                        </div>

                        <ul className="space-y-4">
                            {company?.phone && (
                                <li className="flex gap-3">
                                    <Phone className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
                                    <span>
                                        <a href={telHref(company.phone)} className="font-medium hover:text-red-600">{company.phone}</a>
                                        <span className="block text-xs text-muted-foreground">Chamada para rede móvel nacional</span>
                                    </span>
                                </li>
                            )}
                            {company?.email && (
                                <li className="flex gap-3">
                                    <Mail className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
                                    <a href={`mailto:${company.email}`} className="break-all font-medium hover:text-red-600">{company.email}</a>
                                </li>
                            )}
                            {company?.address && (
                                <li className="flex gap-3">
                                    <MapPin className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
                                    <address className="not-italic">
                                        {company.address}
                                        {company.google_maps_url && (
                                            <a href={company.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-1 block w-fit text-sm font-semibold text-red-600 hover:underline">
                                                Como chegar (Google Maps)
                                            </a>
                                        )}
                                    </address>
                                </li>
                            )}
                            <li className="flex gap-3">
                                <Clock className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
                                <dl className="space-y-1 text-sm">
                                    {openingHoursRows(company).map((row) => (
                                        <div key={row.label} className="flex gap-3">
                                            <dt className="w-32 text-muted-foreground">{row.label}</dt>
                                            <dd>{row.text}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </li>
                        </ul>

                        {(company?.facebook_url || company?.instagram_url) && (
                            <div className="flex items-center gap-4">
                                {company.facebook_url && (
                                    <Link href={company.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-red-600">
                                        <Facebook className="size-7" />
                                    </Link>
                                )}
                                {company.instagram_url && (
                                    <Link href={company.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-red-600">
                                        <Instagram className="size-7" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <section aria-labelledby="form-heading" className="order-1 rounded-xl border p-5 sm:p-6 lg:order-2">
                        <h2 id="form-heading" className="text-xl font-bold">Envie-nos uma mensagem</h2>

                        {status === "sent" ? (
                            <div role="status" className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
                                <CheckCircle2 className="size-12 text-green-600" aria-hidden />
                                <p className="text-lg font-semibold">Obrigado pela sua mensagem!</p>
                                <p className="text-sm text-muted-foreground">Responderemos assim que possível.</p>
                                <button type="button" onClick={() => setStatus("idle")} className="mt-2 text-sm font-medium text-red-600 hover:underline">
                                    Enviar outra mensagem
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="mt-5 space-y-4">
                                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                                    <label htmlFor="website">Não preencher</label>
                                    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                </div>

                                {vehicle && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-100 px-4 py-3 text-sm">
                                        <span>Sobre: <strong>{vehicle.title}</strong></span>
                                        <button type="button" onClick={removeVehicle} aria-label="Remover viatura" className="text-muted-foreground hover:text-foreground">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-1.5 sm:col-span-2">
                                        <span className="text-sm font-medium">Nome</span>
                                        <Input className="h-11" name="name" autoComplete="name" required minLength={2} maxLength={100} value={values.name} onChange={set("name")} />
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-sm font-medium">Email</span>
                                        <Input className="h-11" name="email" type="email" autoComplete="email" required maxLength={100} value={values.email} onChange={set("email")} />
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-sm font-medium">Telefone <span className="font-normal text-muted-foreground">(opcional)</span></span>
                                        <Input className="h-11" name="phone" type="tel" inputMode="tel" autoComplete="tel" pattern="[\d\s+()-]{9,20}" title="Indique um número com pelo menos 9 dígitos" value={values.phone} onChange={set("phone")} />
                                    </label>
                                    <label className="space-y-1.5 sm:col-span-2">
                                        <span className="text-sm font-medium">Assunto</span>
                                        <Input className="h-11" name="subject" required maxLength={255} value={values.subject} onChange={set("subject")} />
                                    </label>
                                    <label className="space-y-1.5 sm:col-span-2">
                                        <span className="text-sm font-medium">Mensagem</span>
                                        <Textarea name="message" rows={5} required value={values.message} onChange={set("message")} />
                                    </label>
                                </div>

                                {sendError && <p role="alert" className="text-sm text-red-600">{sendError}</p>}

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="flex h-12 w-full items-center justify-center rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto sm:px-8"
                                >
                                    {status === "sending" ? "A enviar..." : "Enviar mensagem"}
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
