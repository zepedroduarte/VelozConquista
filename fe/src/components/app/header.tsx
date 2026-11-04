// Cabeçalho gerado no servidor: só o menu do telemóvel e o realce da página atual correm no browser.
import Link from "next/link";
import { Phone } from "lucide-react";
import { CompanySettings } from "@/lib/types";
import { telHref } from "@/lib/seo";
import { MobileNav, NavLinks } from "./mobileNav";

export const NAV_LINKS = [
  { href: "/veiculos", label: "Viaturas" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contacto", label: "Contactos" },
];

export function Header({ company }: { company: CompanySettings | null }) {
  const name = company?.name || "Veloz Conquista";

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="site-container flex h-14 items-center justify-between gap-4 md:h-16">
        <Link href="/" className="flex items-center shrink-0" aria-label={`${name} — página inicial`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- PNG de 3 KB, não precisa de otimização */}
          <img src="/logo-wide.png" alt={name} width={225} height={82} className="h-9 w-auto md:h-11" />
        </Link>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLinks links={NAV_LINKS} />
        </nav>

        <div className="flex items-center gap-2">
          {company?.phone && (
            <a
              href={telHref(company.phone)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Phone className="size-4" />
              <span className="hidden sm:inline">{company.phone}</span>
              <span className="sm:hidden">Ligar</span>
            </a>
          )}
          <MobileNav links={NAV_LINKS} company={company} />
        </div>
      </div>
    </header>
  );
}
