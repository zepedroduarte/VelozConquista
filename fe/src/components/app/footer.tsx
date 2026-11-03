// Rodapé gerado no servidor: nome, morada, telefone e horário ficam no HTML que o
// Google lê, sempre iguais aos do Google Business Profile (essencial para o SEO local).
import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { CompanySettings } from "@/lib/types";
import { DEFAULT_LOCALITY, openingHoursRows, toLines } from "@/lib/seo";

export function Footer({ company }: { company: CompanySettings | null }) {
  const name = company?.name || "Veloz Conquista";
  const areas = toLines(company?.service_areas);
  const phoneHref = company?.phone ? `tel:+351${company.phone.replace(/\D/g, "").replace(/^351/, "")}` : undefined;

  return (
    <footer className="border-t bg-background">
      <h2 className="sr-only">Informações do stand</h2>
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            Stand de automóveis usados e semi-novos em {company?.locality || DEFAULT_LOCALITY}. Financiamento automóvel.
          </p>
          <div className="flex items-center gap-4">
            {company?.facebook_url && (
              <Link href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            )}
            {company?.instagram_url && (
              <Link href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-medium">Contacto</h3>
          <address className="not-italic space-y-2 text-sm text-muted-foreground">
            {company?.address && (
              <p className="flex gap-2">
                <MapPin className="size-4 shrink-0 mt-0.5 text-red-600" />
                {company.google_maps_url ? (
                  <a href={company.google_maps_url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{company.address}</a>
                ) : company.address}
              </p>
            )}
            {company?.phone && (
              <p className="flex gap-2"><Phone className="size-4 shrink-0 mt-0.5 text-red-600" /><a href={phoneHref} className="hover:text-foreground">{company.phone}</a></p>
            )}
            {company?.email && (
              <p className="flex gap-2"><Mail className="size-4 shrink-0 mt-0.5 text-red-600" /><a href={`mailto:${company.email}`} className="hover:text-foreground break-all">{company.email}</a></p>
            )}
          </address>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-medium flex items-center gap-2"><Clock className="size-4 text-red-600" /> Horário</h3>
          <dl className="space-y-1.5 text-sm text-muted-foreground">
            {openingHoursRows(company).map((row) => (
              <div key={row.label} className="flex justify-between gap-4 max-w-60">
                <dt>{row.label}</dt>
                <dd className="text-foreground/80">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-medium">Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/veiculos" className="text-muted-foreground hover:text-foreground">Carros usados à venda</Link></li>
            <li><Link href="/sobre" className="text-muted-foreground hover:text-foreground">Sobre nós</Link></li>
            <li><Link href="/contacto" className="text-muted-foreground hover:text-foreground">Contactos e localização</Link></li>
            <li><Link href="/admin/dashboard" rel="nofollow" className="text-muted-foreground hover:text-foreground">Área reservada</Link></li>
          </ul>
          {areas.length > 0 && (
            <p className="text-xs text-muted-foreground pt-2">
              Servimos clientes de {areas.join(", ")}.
            </p>
          )}
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
