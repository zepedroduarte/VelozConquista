'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";

const navLinks = [
    { href: "/veiculos", label: "Veículos" },
    { href: "/sobre", label: "Sobre Nós" },
    { href: "/contacto", label: "Contacto" },
];

export function MobileNav() {
    const { company } = useCompany();
    const pathname = usePathname();

    return (
        <div className="flex flex-col p-5 gap-6">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-red-600 font-black text-xl leading-none">▲</span>
                <span className="font-bold text-lg">{company?.name ?? "Veloz Conquista"}</span>
            </Link>

            <nav className="flex flex-col gap-1">
                {navLinks.map(({ href, label }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? "bg-red-50 text-red-600"
                                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
