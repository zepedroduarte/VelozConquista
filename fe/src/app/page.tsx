import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
          <div className="container relative z-20 flex flex-col items-start justify-center h-[600px] text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Veloz Conquista</h1>
            <p className="mt-4 max-w-lg text-xl text-white/90">Veículos seminovos e usados de qualidade.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/vehicles">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  Ver Veículos
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
