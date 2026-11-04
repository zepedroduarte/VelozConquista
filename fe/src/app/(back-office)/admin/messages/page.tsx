'use client'

import { useState } from "react";
import { Car, Loader2, Mail, MailOpen, MessageCircle, MessageSquare, Phone, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminMessage, apiErrorMessage, useAdminData } from "@/lib/admin";
import { telHref, whatsappHref } from "@/lib/seo";


export default function MessagesPage() {
    const [onlyUnread, setOnlyUnread] = useState(false);
    const { data: messages, setData, isLoading, error } = useAdminData<AdminMessage[]>(`/admin/messages/${onlyUnread ? "?unread=1" : ""}`);
    const [openId, setOpenId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function setRead(message: AdminMessage, is_read: boolean) {
        setData((prev) => prev?.map((m) => (m.id === message.id ? { ...m, is_read } : m)) ?? null);
        try {
            await api.patch(`/admin/messages/${message.id}/`, { is_read });
        } catch (err) {
            setActionError(apiErrorMessage(err));
        }
    }

    function toggle(message: AdminMessage) {
        setOpenId(openId === message.id ? null : message.id);
        if (!message.is_read) setRead(message, true);
    }

    async function remove(id: number) {
        if (!window.confirm("Apagar esta mensagem?")) return;
        try {
            await api.delete(`/admin/messages/${id}/`);
            setData((prev) => prev?.filter((m) => m.id !== id) ?? null);
        } catch (err) {
            setActionError(apiErrorMessage(err));
        }
    }

    const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"><MessageSquare className="size-7 text-red-600" /> Mensagens</h1>
                    <p className="text-muted-foreground">Pedidos de contacto enviados pelo site{unreadCount > 0 && ` · ${unreadCount} por ler`}.</p>
                </div>
                <div className="flex rounded-md border bg-background p-0.5 text-sm w-fit">
                    <button type="button" onClick={() => setOnlyUnread(false)} className={`px-3 py-1.5 rounded ${!onlyUnread ? "bg-red-600 text-white" : ""}`}>Todas</button>
                    <button type="button" onClick={() => setOnlyUnread(true)} className={`px-3 py-1.5 rounded ${onlyUnread ? "bg-red-600 text-white" : ""}`}>Por ler</button>
                </div>
            </div>

            {actionError && <p className="text-sm text-red-600">{actionError}</p>}

            {isLoading && !messages ? (
                <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-red-600" /></div>
            ) : error ? <p className="text-red-600">{error}</p> : messages?.length === 0 ? (
                <Card className="border-none shadow-sm py-0"><CardContent className="p-10 text-center text-muted-foreground">Sem mensagens.</CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {messages?.map((m) => {
                        const isOpen = openId === m.id;
                        return (
                            <Card key={m.id} className={`border-none shadow-sm py-0 ${!m.is_read ? "ring-1 ring-red-200" : ""}`}>
                                <CardContent className="p-0">
                                    <button type="button" onClick={() => toggle(m)} className="w-full text-left p-4 sm:p-5 flex items-start gap-3">
                                        {m.is_read ? <MailOpen className="size-5 text-muted-foreground shrink-0 mt-0.5" /> : <Mail className="size-5 text-red-600 shrink-0 mt-0.5" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className={`truncate ${m.is_read ? "" : "font-semibold"}`}>{m.sender_name}</p>
                                                <span className="text-xs text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</span>
                                            </div>
                                            <p className={`text-sm truncate ${m.is_read ? "text-muted-foreground" : "text-foreground"}`}>{m.vehicle && <Car className="inline size-4 mr-1 text-red-600 align-text-bottom" aria-label="Sobre uma viatura" />}{m.subject}</p>
                                            {!isOpen && <p className="text-sm text-muted-foreground truncate">{m.body}</p>}
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 sm:pl-13">
                                            {m.vehicle && (
                                                <a href={`/veiculos/${m.vehicle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium hover:text-red-600">
                                                    <Car className="size-4 text-red-600" /> {m.vehicle_title}
                                                </a>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1">
                                                    <a href={`mailto:${m.sender_email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}><Mail className="size-4" /> Responder</a>
                                                </Button>
                                                {m.sender_phone_number && (
                                                    <>
                                                        <Button asChild size="sm" variant="outline" className="gap-1"><a href={telHref(m.sender_phone_number)}><Phone className="size-4" /> Ligar</a></Button>
                                                        <Button asChild size="sm" variant="outline" className="gap-1"><a href={whatsappHref(m.sender_phone_number)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" /> WhatsApp</a></Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => setRead(m, false)}>Marcar como não lida</Button>
                                                <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="gap-1 text-red-600"><Trash2 className="size-4" /> Apagar</Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{m.sender_email}{m.sender_phone_number ? ` · ${m.sender_phone_number}` : ""}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
