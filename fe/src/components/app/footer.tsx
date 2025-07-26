import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="w-[70vw] mx-auto py-3 md:py-3 px-4">
        <div className="hidden md:grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Veloz Conquista</h3>
            <p className="text-sm text-muted-foreground">
              Comércio de automóveis usados e semi-novos.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="https://www.facebook.com/velozconquistalda" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://www.instagram.com/velozconquista/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vehicles" className="text-muted-foreground hover:text-foreground">Veículos</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">Sobre Nós</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contato</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Estrada De Sta Eulalia 1</li>
                <li>Ponte Lousa</li>
                <li>Telefone: 918630374</li>
                <li>Email: velozconquista@gmail.com</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Horário</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Segunda - Sexta: 9h - 19h</li>
                <li>Sábado: 10h - 16h</li>
                <li>Domingo: Fechado</li>
            </ul>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          <Accordion type="multiple">
            <AccordionItem value="empresa">
              <AccordionTrigger>Veloz Conquista</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Comércio de automóveis usados e semi-novos.
                </p>
                <div className="flex items-center space-x-4">
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    <Instagram className="h-5 w-5" />
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links">
              <AccordionTrigger>Links Rápidos</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/vehicles" className="text-muted-foreground hover:text-foreground">Veículos</Link></li>
                  <li><Link href="/about" className="text-muted-foreground hover:text-foreground">Sobre Nós</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contato</Link></li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contato">
              <AccordionTrigger>Contato</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Estrada De Sta Eulalia 1</li>
                  <li>Ponte Lousa</li>
                  <li>Telefone: 918630374</li>
                  <li>Email: velozconquista@gmail.com</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="horario">
              <AccordionTrigger>Horário</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Segunda - Sexta: 9h - 19h</li>
                  <li>Sábado: 10h - 16h</li>
                  <li>Domingo: Fechado</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-7 pt-3 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Veloz Conquista. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
