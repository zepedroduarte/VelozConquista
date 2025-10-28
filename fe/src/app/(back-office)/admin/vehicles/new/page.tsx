'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const MOCK_OPTIONS = {
    transmission: ['Automática', 'Manual'],
    fuel: ['Gasolina', 'Diesel', 'Elétrico', 'Híbrido'],
    bodyStyle: ['Sedan', 'SUV', 'Hatchback', 'Coupé'],
    status: ['Disponível', 'Reservado', 'Preparação']
};

const AddVehicleSchema = z.object({
  make: z.string().min(1, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  version: z.string().optional(),
  license_plate: z.string().min(1, "Matrícula é obrigatória."),
  mileage: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Quilometragem inválida."),
  color: z.string().min(1, "Cor é obrigatória."),
  seats: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, "Lugares inválidos."),
  doors: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 1, "Portas inválidas."),
  power: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Potência inválida."),
  engine_size: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Cilindrada inválida."),
  transmission_type: z.string().min(1, "Transmissão é obrigatória."),
  fuel_type: z.string().min(1, "Combustível é obrigatório."),
  body_style: z.string().min(1, "Carroçaria é obrigatória."),
  status: z.string().min(1, "Status é obrigatório."),
  purchase_price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Preço de compra inválido."),
  retail_price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Preço de venda inválido."),
  images: z.any().optional(), 
});

type AddVehicleValues = z.infer<typeof AddVehicleSchema>;

export default function NewVehiclePage() {
    
    const form = useForm<AddVehicleValues>({
        resolver: zodResolver(AddVehicleSchema),
        defaultValues: {
            make: "",
            model: "",
            version: "",
            license_plate: "",
            mileage: "0",
            color: "",
            seats: "5",
            doors: "5",
            power: "0",
            engine_size: "0",
            transmission_type: "",
            fuel_type: "",
            body_style: "",
            status: MOCK_OPTIONS.status[0],
            purchase_price: "0.00",
            retail_price: "0.00",
        },
    });

    function onSubmit(values: AddVehicleValues) {
        console.log("Submissão do Novo Veículo:", values);
    }

    return (
        <main className="flex-1 py-10 px-4">
            <div className="w-[70vw] mx-auto space-y-8">
                
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Link href="/admin/vehicles" passHref>
                            <Button variant="link" className="w-fit p-0 h-auto gap-1 text-primary hover:text-primary/80">
                                <ChevronLeft className="size-4" /> Voltar
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Adicionar Novo Veículo</h1>
                        <p className="text-muted-foreground">Insira todos os dados do novo veículo em stock.</p>
                    </div>
                </div>

                <Form {...form}>
                    <form 
                        id="add-vehicle-form"
                        onSubmit={form.handleSubmit(onSubmit)} 
                        className="space-y-8"
                    >
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            <div className="lg:col-span-2 space-y-8">
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>1. Informação Básica</CardTitle>
                                        <CardDescription>Marca, modelo e identificação.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField control={form.control} name="make" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Marca *</FormLabel>
                                                    <FormControl><Input placeholder="Ex: Mercedes-Benz" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="model" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Modelo *</FormLabel>
                                                    <FormControl><Input placeholder="Ex: Classe C" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="version" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Versão</FormLabel>
                                                    <FormControl><Input placeholder="Ex: 220d AMG Line" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="license_plate" render={({ field }) => (
                                                <FormItem className="md:col-span-3">
                                                    <FormLabel>Matrícula *</FormLabel>
                                                    <FormControl><Input placeholder="Ex: 00-AA-00" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>2. Especificações Técnicas</CardTitle>
                                        <CardDescription>Características do motor e estrutura.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <FormField control={form.control} name="power" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Potência (cv) *</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="engine_size" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cilindrada (cc) *</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="seats" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lugares *</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="doors" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Portas *</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="mileage" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quilometragem (km) *</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="color" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cor Exterior *</FormLabel>
                                                    <FormControl><Input placeholder="Ex: Preto Obsidiana" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>3. Imagens do Veículo</CardTitle>
                                        <CardDescription>Imagens (múltiplas) para o Front Office.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField control={form.control} name="images" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ficheiros de Imagem</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="file" 
                                                        multiple 
                                                        onChange={(e) => field.onChange(e.target.files)}
                                                        value={undefined} 
                                                    />
                                                </FormControl>
                                                <FormDescription>Selecione a imagem principal (será marcada automaticamente no Django).</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="lg:col-span-1 space-y-8">

                                <Card>
                                    <CardHeader>
                                        <CardTitle>4. Preços e Status</CardTitle>
                                        <CardDescription>Informação de stock e venda.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        
                                        <FormField control={form.control} name="status" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status *</FormLabel>
                                                <FormControl><Input placeholder={MOCK_OPTIONS.status[0]} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        <FormField control={form.control} name="purchase_price" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preço de Compra (€) *</FormLabel>
                                                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        <FormField control={form.control} name="retail_price" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preço de Venda (Retalho) (€) *</FormLabel>
                                                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>5. Categorização</CardTitle>
                                        <CardDescription>Tipos de veículo (FKs).</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="transmission_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transmissão *</FormLabel>
                                                <FormControl><Input placeholder={MOCK_OPTIONS.transmission[0]} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="fuel_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Combustível *</FormLabel>
                                                <FormControl><Input placeholder={MOCK_OPTIONS.fuel[0]} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="body_style" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Carroçaria *</FormLabel>
                                                <FormControl><Input placeholder={MOCK_OPTIONS.bodyStyle[0]} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                             <Button type="submit" form="add-vehicle-form" className="bg-red-600 hover:bg-red-700 text-white">
                                Guardar Veículo
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </main>
    );
}