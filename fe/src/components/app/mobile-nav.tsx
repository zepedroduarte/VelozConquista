import Link from "next/link"
import { AdminToggle } from "./admin-toggle"

export function MobileNav() {
  return (
    <div className="flex flex-col space-y-3 p-4">
      <Link href="/" className="mb-4 flex items-center">
        <span className="font-bold text-xl">Veloz Conquista</span>
      </Link>
      <div className="flex flex-col space-y-2">
        <Link href="/veiculos" className="text-foreground/70 transition-colors hover:text-foreground">
          Veículos
        </Link>
        <Link href="/sobre" className="text-foreground/70 transition-colors hover:text-foreground">
          Sobre Nós
        </Link>
        <Link href="/contacto" className="text-foreground/70 transition-colors hover:text-foreground">
          Contacto
        </Link>
        <AdminToggle />
      </div>
    </div>
  )
}
