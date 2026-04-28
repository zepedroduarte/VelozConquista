import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { VehicleOptionsProvider } from "@/context/VehicleOptionsContext";
import { CompanyProvider } from "@/context/CompanyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veloz Conquista",
  description: "Comércio de automóveis usados e semi-novos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <CompanyProvider>
          <AuthProvider>
            <VehicleOptionsProvider>
              {children}
            </VehicleOptionsProvider>
          </AuthProvider>
        </CompanyProvider> 
      </body>
    </html>
  );
}