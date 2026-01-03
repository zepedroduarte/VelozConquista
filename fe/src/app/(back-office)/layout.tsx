'use client'

import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from "react"; 
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { AdminSidebar } from "@/components/app/adminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const checkSecurity = async () => {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            try {
                await api.get('/admin/vehicles/'); 
            } catch (err) {
                logout();
            }
        };

        checkSecurity();
    }, [isAuthenticated, logout, router]);


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
