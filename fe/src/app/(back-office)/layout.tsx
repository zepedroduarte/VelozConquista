'use client'

import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import { useEffect } from "react"; 
import api from '@/lib/axios';
import { AdminSidebar } from "@/components/app/adminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, logout, isLoading } = useAuth();
    const router = useRouter();


    useEffect(() => {
        if (isLoading) return;
        const checkSecurity = async () => {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            try {
                await api.get('/admin/vehicles/'); 
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

                <main className="lg:col-start-2 w-full">
                    {children}
                </main>
            </div>
        </>
    );
}
