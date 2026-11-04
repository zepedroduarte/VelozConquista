'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Menu, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CompanySettings } from "@/lib/types";
import { telHref } from "@/lib/seo";

type NavLink = { href: string; label: string };

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return links.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(pathname, href) ? "page" : undefined}
      className="rounded-full px-4 py-2 text-foreground/80 hover:bg-neutral-100 hover:text-foreground aria-[current=page]:text-red-600"
    >
      {label}
    </Link>
  ));
}

export function MobileNav({ links, company }: { links: NavLink[]; company: CompanySettings | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden inline-flex size-10 items-center justify-center rounded-full border hover:bg-neutral-100"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 p-0">
        <SheetTitle className="border-b px-5 py-4 text-base">Menu</SheetTitle>
        <nav aria-label="Menu" className="flex flex-col py-2">
          <Link href="/" onClick={() => setOpen(false)} aria-current={pathname === "/" ? "page" : undefined}
            className="px-5 py-3 text-lg font-medium aria-[current=page]:text-red-600">
            Início
          </Link>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="px-5 py-3 text-lg font-medium aria-[current=page]:text-red-600"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t bg-neutral-50 px-5 py-5 text-sm">
          {company?.phone && (
            <a href={telHref(company.phone)} className="flex items-center gap-3 font-semibold">
              <Phone className="size-4 text-red-600" /> {company.phone}
            </a>
          )}
          {company?.email && (
            <a href={`mailto:${company.email}`} className="flex items-center gap-3 break-all">
              <Mail className="size-4 shrink-0 text-red-600" /> {company.email}
            </a>
          )}
          {company?.address && (
            <a href={company.google_maps_url || "/contacto"} target={company.google_maps_url ? "_blank" : undefined}
              rel="noopener noreferrer" className="flex gap-3 text-muted-foreground">
              <MapPin className="size-4 shrink-0 mt-0.5 text-red-600" /> {company.address}
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
