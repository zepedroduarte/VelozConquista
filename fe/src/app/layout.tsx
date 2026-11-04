import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: {
    default: "Stand de Carros Usados em Loures | Veloz Conquista",
    template: "%s | Veloz Conquista",
  },
  description: "Stand de automóveis usados e semi-novos em Ponte de Lousa, Loures. Financiamento automóvel até 120 meses e atendimento personalizado.",
  applicationName: "Veloz Conquista",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Veloz Conquista",
  },
  // Códigos de verificação do Google Search Console e do Bing Webmaster Tools (variáveis na Vercel)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Abre a ligação ao servidor das fotos antes de o browser encontrar a primeira imagem
  preconnect(IMAGE_HOST);

  return (
    <html lang="pt-PT">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}