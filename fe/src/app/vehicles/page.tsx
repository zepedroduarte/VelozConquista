import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function VehiclesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Nossos Veículos</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-lg font-medium mb-4">Filtros</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <Input id="search" placeholder="Buscar por marca, modelo..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as Marcas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Marcas</SelectItem>
                        <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Carroceria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os Tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="coupe">Coupé</SelectItem>
                        <SelectItem value="truck">Picape</SelectItem>
                        <SelectItem value="convertible">Conversível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Transmissão</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as Transmissões" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Transmissões</SelectItem>
                        <SelectItem value="automatic">Automática</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Combustível</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os Combustíveis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Combustíveis</SelectItem>
                        <SelectItem value="gasoline">Gasolina</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Elétrico</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Faixa de Preço</Label>
                      <span className="text-sm text-muted-foreground">R$ 0 - R$ 500.000</span>
                    </div>
                    <Slider defaultValue={[0, 500000]} min={0} max={500000} step={10000} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Características</Label>
                    <div className="space-y-2">
                      {["Bancos de Couro", "Sistema de Navegação", "Bluetooth", "Câmera de Ré", "Teto Solar"].map(
                        (feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox id={feature.toLowerCase().replace(/\s+/g, "-")} />
                            <label
                              htmlFor={feature.toLowerCase().replace(/\s+/g, "-")}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature}
                            </label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <Button className="w-full">Aplicar Filtros</Button>
                </div>
              </div>
            </div>

            {/* Vehicle Listings */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Mostrando 12 de 36 veículos</div>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                    <SelectItem value="oldest">Mais Antigos</SelectItem>
                    <SelectItem value="price-low">Preço: Menor para Maior</SelectItem>
                    <SelectItem value="price-high">Preço: Maior para Menor</SelectItem>
                    <SelectItem value="mileage-low">Quilometragem: Menor para Maior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={`/placeholder.svg?height=200&width=400&text=Carro+${i + 1}`}
                        alt={`Carro ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>
                        {
                          [
                            "Mercedes-Benz Classe C",
                            "BMW Série 3",
                            "Audi A4",
                            "Toyota Camry",
                            "Honda Accord",
                            "Tesla Model 3",
                          ][i % 6]
                        }
                      </CardTitle>
                      <CardDescription>
                        {2023 - (i % 5)} • {(i + 1) * 2500} km • {i % 2 === 0 ? "Automático" : "Manual"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">R$ {180000 + i * 10000}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {Math.floor((180000 + i * 10000) / 60)}/mês est.
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {["Gasolina", "Diesel", "Elétrico", "Híbrido"][i % 4]}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {["Sedan", "SUV", "Coupé", "Conversível", "Picape"][i % 5]}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {["2.0L", "3.0L", "1.8L", "2.5L"][i % 4]}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/vehicles/${i + 1}`} className="w-full">
                        <Button className="w-full">Ver Detalhes</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" disabled>
                    &lt;
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="icon">
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
