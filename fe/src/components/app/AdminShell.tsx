'use client'

import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import api from '@/lib/axios';
import { AdminSidebar } from "@/components/app/adminSidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, logout, isLoading } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    useEffect(() => {
        if (isLoading) return;
        const checkSecurity = async () => {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            try {
                await api.get('/admin/settings/company/');
            } catch {
                logout();
            }
        };

        checkSecurity();
    }, [isAuthenticated, isLoading, logout, router]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-muted">
                <p>A validar sessão...</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[250px_1fr] bg-muted">
                <div className="fixed hidden lg:block lg:w-[250px] h-screen border-r border-sidebar-border">
                    <AdminSidebar />
                </div>

                {/* Telemóvel: barra no topo com menu */}
                <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-background px-4 h-14">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Abrir menu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[270px]">
                            <SheetTitle className="sr-only">Menu de administração</SheetTitle>
                            <AdminSidebar onNavigate={() => setIsMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold">Administração</span>
                </div>

                <main className="lg:col-start-2 w-full min-w-0">
                    {children}
                </main>
            </div>
        </>
    );
}
