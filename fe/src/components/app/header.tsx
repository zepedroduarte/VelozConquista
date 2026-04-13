'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MobileNav } from "./mobileNav";
import { useCompany } from "@/context/CompanyContext";

const navLinks = [
    { href: "/veiculos", label: "Veículos" },
    { href: "/sobre", label: "Sobre Nós" },
    { href: "/contacto", label: "Contacto" },
];

export function Header() {
    const { company } = useCompany();
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md h-16 flex items-center px-4 shadow-sm">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                    <MobileNav />
                </SheetContent>
            </Sheet>

            <div className="mx-auto w-[min(70vw,1200px)] flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-red-600 font-black text-xl leading-none">▲</span>
                        <span className="font-bold text-lg tracking-tight group-hover:text-red-600 transition-colors">
                            {company?.name ?? "Veloz Conquista"}
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        {navLinks.map(({ href, label }) => {
                            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`relative px-3 py-1.5 rounded-md transition-colors ${
                                        active
                                            ? "text-red-600 bg-red-50"
                                            : "text-foreground/70 hover:text-foreground hover:bg-muted"
                                    }`}
                                >
                                    {label}
                                    {active && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-red-600 rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <Link href="/veiculos" className="hidden md:block">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 transition-all">
                        Ver Veículos
                    </Button>
                </Link>
            </div>
        </header>
    );
}
