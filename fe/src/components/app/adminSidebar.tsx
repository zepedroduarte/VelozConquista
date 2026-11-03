import Link from "next/link";
import { Car, DollarSign, Users, Wrench, MessageSquare, Home, LogOut, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/vehicles", label: "Gestão de Stock", icon: Car },
    { href: "/admin/sales", label: "Registo de Vendas", icon: DollarSign },
    { href: "/admin/services", label: "Custos / Oficina", icon: Wrench },
    { href: "/admin/customers", label: "Clientes", icon: Users },
    { href: "/admin/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/admin/settings", label: "Definições do Site", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { company } = useCompany();
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    async function onSubmit() {
        logout();
        router.push('/');
    }

    return (
        <aside className="h-full w-full bg-sidebar text-sidebar-foreground flex flex-col p-4 shadow-xl">

            <div className="mb-8 pt-2 pb-4 border-b border-sidebar-border">
                <Link href="/admin/dashboard" onClick={onNavigate} className="text-xl font-bold text-red-600">
                    {company?.name} <span className="text-sm font-light text-foreground/70">Admin</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link key={item.href} href={item.href} onClick={onNavigate} passHref>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start space-x-3 text-sm font-medium transition-colors ${isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'hover:bg-sidebar-accent/20'}`}
                            >
                                <item.icon className="size-5 shrink-0" />
                                <span>{item.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-sidebar-border">
                <div className="mt-auto space-y-1">

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-primary"
                        asChild
                    >
                        <Link href="/" title="Ir para o site público">
                            <Globe className="size-4" />
                            <span>Voltar ao Site</span>
                        </Link>
                    </Button>

                    <Button
                        onClick={onSubmit}
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-primary"
                    >
                        <LogOut className="size-4" />
                        <span>Terminar Sessão</span>
                    </Button>

                </div>
            </div>
        </aside>
    );
}
