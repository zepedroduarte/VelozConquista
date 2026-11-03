import type { Metadata } from "next";

// A página de contacto é interativa (formulário), por isso o título fica aqui.
export const metadata: Metadata = {
    title: "Contactos e Localização · Ponte de Lousa, Loures",
    description: "Contacte a Veloz Conquista: telefone, email, morada em Ponte de Lousa (Loures), horário e formulário de contacto. Marque a sua visita ao stand.",
    alternates: { canonical: "/contacto" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
