'use client'

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// No telemóvel abre o menu de partilha do próprio telefone; no computador copia o link.
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    async function share() {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // Partilha cancelada
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copie o link:", url);
        }
    }

    return (
        <button type="button" onClick={share} className={`inline-flex items-center gap-2 ${className}`}>
            {copied ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
            {copied ? "Link copiado" : "Partilhar"}
        </button>
    );
}
