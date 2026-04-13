'use client';

import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useCompany } from "@/context/CompanyContext";

export function Footer() {
    const { isAuthenticated } = useAuth();
    const { company } = useCompany();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <footer className="border-t bg-neutral-950 min-h-[200px]" />;
    }

    return (
        <footer className="bg-neutral-950 text-white/70">
            <div className="mx-auto w-[min(70vw,1200px)] pt-12 pb-6 px-4">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-white/10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-red-500 font-black text-xl leading-none">▲</span>
                            <h3 className="text-white font-bold text-lg">{company?.name ?? "Veloz Conquista"}</h3>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Comércio de automóveis usados e semi‑novos. A sua confiança é a nossa prioridade.
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                            {company?.facebook_url ? (
                                <Link href={company.facebook_url} target="_blank" rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-red-600 hover:text-white transition-all">
                                    <Facebook className="h-4 w-4" />
                                    <span className="sr-only">Facebook</span>
                                </Link>
                            ) : null}
                            {company?.instagram_url ? (
                                <Link href={company.instagram_url} target="_blank" rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-red-600 hover:text-white transition-all">
                                    <Instagram className="h-4 w-4" />
                                    <span className="sr-only">Instagram</span>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Links Rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { href: "/veiculos", label: "Veículos" },
                                { href: "/sobre", label: "Sobre Nós" },
                                { href: "/contacto", label: "Contacto" },
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="hover:text-white hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5">
                                        <span className="text-red-500">›</span> {label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                {isAuthenticated ? (
                                    <Link href="/admin/dashboard" className="font-semibold text-red-500 hover:text-red-400 inline-flex items-center gap-1.5 transition-colors">
                                        <span>›</span> Área Reservada
                                    </Link>
                                ) : (
                                    <Link href="/login" className="hover:text-white inline-flex items-center gap-1.5 transition-colors">
                                        <span className="text-red-500">›</span> Área Reservada
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Contacto</h3>
                        <ul className="space-y-3 text-sm">
                            {company?.address && (
                                <li className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{company.address}</span>
                                </li>
                            )}
                            {company?.phone && (
                                <li>
                                    <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                        <Phone className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>{company.phone}</span>
                                    </a>
                                </li>
                            )}
                            {company?.email && (
                                <li>
                                    <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                        <Mail className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>{company.email}</span>
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Hours */}
                    <div className="space-y-4">
                        <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Horário</h3>
                        <ul className="space-y-2 text-sm">
                            {[
                                { day: "Segunda – Sexta", hours: "9h – 19h" },
                                { day: "Sábado", hours: "10h – 16h" },
                                { day: "Domingo", hours: "Fechado" },
                            ].map(({ day, hours }) => (
                                <li key={day} className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                    <span>
                                        <span className="text-white/50">{day}:</span>{" "}
                                        <span className={hours === "Fechado" ? "text-red-400" : "text-white/80"}>{hours}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
                    <p>&copy; {new Date().getFullYear()} {company?.name ?? "Veloz Conquista"}. Todos os direitos reservados.</p>
                    <p>Desenvolvido com dedicação</p>
                </div>
            </div>
        </footer>
    );
}
