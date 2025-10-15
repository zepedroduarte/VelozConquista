import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white py-32">
        <div className="w-[70vw] mx-auto flex flex-col items-start justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Veloz Conquista
          </h1>
          <p className="mt-4 max-w-lg text-xl text-white/80">
            Comércio de automóveis usados e semi-novos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/vehicles">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                Ver Veículos
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 transition-all"
              >
                Contacto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="w-[70vw] mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Veículos em Destaque</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Descubra a nossa seleção de veículos premium, seminovos e usados de qualidade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden p-0 border-none bg-card shadow-lg">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=200&width=400&text=Carro+${i}`}
                    alt={`Carro em destaque ${i}`}
                    fill
                    className="object-cover rounded-t-xl"
                  />
                </div>
                <CardHeader className="py-4">
                  <CardTitle>Mercedes-Benz Classe C</CardTitle>
                  <CardDescription>2023 • 2.500 km • Automático</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">245.999 €</div>
                    <div className="text-sm text-muted-foreground">2.999 €/mês est.</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      Gasolina
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      Sedan
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      2.0L
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/vehicles/${i}`} className="w-full">
                    <Button className="w-full">Ver Detalhes</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/vehicles">
              <Button variant="outline" size="lg" className="gap-2">
                Ver Todos os Veículos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}