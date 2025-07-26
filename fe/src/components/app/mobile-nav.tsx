import Link from "next/link"

export function MobileNav() {
  return (
    <div className="flex flex-col space-y-3 p-4">
      <Link href="/" className="mb-4 flex items-center">
        <span className="font-bold text-xl">Veloz Conquista</span>
      </Link>
      <div className="flex flex-col space-y-2">
        <Link href="/vehicles" className="text-foreground/70 transition-colors hover:text-foreground">
          Veículos
        </Link>
        <Link href="/about" className="text-foreground/70 transition-colors hover:text-foreground">
          Sobre Nós
        </Link>
        <Link href="/contact" className="text-foreground/70 transition-colors hover:text-foreground">
          Contato
        </Link>
      </div>
    </div>
  )
}
