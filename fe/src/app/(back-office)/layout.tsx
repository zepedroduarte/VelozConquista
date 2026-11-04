// Os contextos de sessão, empresa e opções só são carregados no back-office:
// as páginas públicas recebem os dados do servidor e não precisam deste JavaScript.
import { AdminShell } from "@/components/app/AdminShell";
import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { VehicleOptionsProvider } from "@/context/VehicleOptionsContext";
import { getCompany, getVehicleOptions } from "@/lib/api-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const [company, vehicleOptions] = await Promise.all([
        getCompany().catch(() => null),
        getVehicleOptions().catch(() => null),
    ]);

    return (
        <AuthProvider>
            <CompanyProvider initialCompany={company}>
                <VehicleOptionsProvider initialOptions={vehicleOptions}>
                    <AdminShell>{children}</AdminShell>
                </VehicleOptionsProvider>
            </CompanyProvider>
        </AuthProvider>
    );
}
