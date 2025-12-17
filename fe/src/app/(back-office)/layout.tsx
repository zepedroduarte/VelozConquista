'use client'

import { AdminSidebar } from "@/components/app/adminSidebar";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import { useEffect } from "react"; 

export default function AdminLayout({
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    
    const { isAuthenticated } = useAuth(); 
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login'); 
        }
    }, [isAuthenticated, router]); 

    if (isAuthenticated) {
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

    return null;
}