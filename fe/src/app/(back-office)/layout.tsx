// fe/src/app/(admin)/layout.tsx

'use client'

import "../globals.css";
import { AdminSidebar } from "@/components/app/adminSidebar";

export default function AdminLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
    }>) {

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[250px_1fr] bg-muted">
                    <div className="fixed hidden lg:block lg:w-[250px] h-screen border-r border-sidebar-border">
                        <AdminSidebar />
                    </div>

                    <main className="lg:col-start-2 w-full">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}