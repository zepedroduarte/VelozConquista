import Link from "next/link";
import { Car, DollarSign, Users, Wrench, MessageSquare, List, Home, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/vehicles", label: "Gestão de Stock", icon: Car },
    { href: "/admin/sales", label: "Registo de Vendas", icon: DollarSign },
    { href: "/admin/services", label: "Serviços/Manutenção", icon: Wrench },
    { href: "/admin/customers", label: "Clientes", icon: Users },
    { href: "/admin/messages", label: "Mensagens", icon: MessageSquare },
    { href: "/admin/logs", label: "Logs do Sistema", icon: List },
];

export function AdminSidebar() {
    const { company } = useCompany();
    const { logout } = useAuth(); 
    const router = useRouter();

    async function onSubmit() {
        logout();     
        router.push('/'); 
    }

    return (
        <aside className="h-full w-full bg-sidebar text-sidebar-foreground flex flex-col p-4 shadow-xl">
            
            <div className="mb-8 pt-2 pb-4 border-b border-sidebar-border">
                <Link href="/admin/dashboard" className="text-xl font-bold text-red-600">
                    {company?.name} <span className="text-sm font-light text-foreground/70">Admin</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} passHref>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start space-x-3 text-sm font-medium hover:bg-sidebar-accent/20 transition-colors"
                        >
                            <item.icon className="size-5 shrink-0" />
                            <span>{item.label}</span>
                        </Button>
                    </Link>
                ))}
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