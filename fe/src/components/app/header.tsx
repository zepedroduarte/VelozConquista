import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { AdminToggle } from "./admin-toggle";


export function Header() {
  return (
    <header className="sticky w-full border-b bg-background backdrop-blur h-16 flex items-center px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <MobileNav />
        </SheetContent>
      </Sheet>

      <div className="w-[70vw] mx-auto flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Veloz Conquista</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/veiculos" className="transition-colors hover:text-foreground/80">
            Veículos
          </Link>
          <Link href="/sobre" className="transition-colors hover:text-foreground/80">
            Sobre Nós
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-foreground/80">
            Contacto
          </Link>
          <AdminToggle />
        </nav>
      </div>
    </header>
  );
}




