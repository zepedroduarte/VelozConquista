import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { VehicleOptionsProvider } from "@/context/VehicleOptionsContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { getCompany, getVehicleOptions } from "@/lib/api-server";
import { IMAGE_HOST, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // só usado nas matrículas do back-office
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Veloz Conquista",
  description: "Comércio de automóveis usados e semi-novos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [company, vehicleOptions] = await Promise.all([getCompany(), getVehicleOptions()]);

  // Abre a ligação ao servidor das fotos antes de o browser encontrar a primeira imagem
  preconnect(IMAGE_HOST);

  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <CompanyProvider initialCompany={company}>
          <AuthProvider>
            <VehicleOptionsProvider initialOptions={vehicleOptions}>
              {children}
            </VehicleOptionsProvider>
          </AuthProvider>
        </CompanyProvider> 
      </body>
    </html>
  );
}