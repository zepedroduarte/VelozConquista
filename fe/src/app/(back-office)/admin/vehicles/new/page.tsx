'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from '@/lib/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Upload, Euro, CarFront, Gauge, Zap, DoorOpen, Armchair, X, Calendar, Info, Settings, Banknote, ImageIcon } from "lucide-react";
import { useVehicleOptions } from "@/context/VehicleOptionsContext";
import Image from 'next/image';

const AddVehicleSchema = z.object({
  make: z.string().min(1, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  version: z.string().optional(),
  license_plate: z.string().min(1, "Matrícula é obrigatória."),
  mileage: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Inválido."),
  color: z.string().min(1, "Cor é obrigatória."),
  seats: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, "Inválido."),
  doors: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, "Inválido."),
  power: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Inválido."),
  engine_size: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Inválido."),
  transmission_type_id: z.string().min(1, "Obrigatório."),
  fuel_type_id: z.string().min(1, "Obrigatório."),
  body_style_id: z.string().min(1, "Obrigatório."),
  traction_type_id: z.string().min(1, "Obrigatório."),
  status_id: z.string().min(1, "Obrigatório."),
  purchase_price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Inválido."),
  retail_price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Inválido."),
  year: z.string().refine(val => {
    const yearNum = parseInt(val);
    const currentYear = new Date().getFullYear();
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1;
  }, "Ano inválido."),
  images: z.any().optional(), 
});

type AddVehicleValues = z.infer<typeof AddVehicleSchema>;

export default function NewVehiclePage() {
    const { 
        fuelType,       
        transmissionType, 
        bodyStyle,      
        tractionType,   
        status        
    } = useVehicleOptions(); // Nota: Verifica se aqui tens 'fuelType' ou 'fuelTypes' no plural, ajusta conforme o teu context

    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const form = useForm<AddVehicleValues>({
        resolver: zodResolver(AddVehicleSchema),
        defaultValues: {
            make: "", model: "", version: "", license_plate: "", mileage: "", color: "",
            seats: "5", doors: "5", power: "", engine_size: "", year: "",
            transmission_type_id: "", fuel_type_id: "", body_style_id: "", traction_type_id: "", status_id: "",
            purchase_price: "", retail_price: "",
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
        e.target.value = ""; 
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[indexToRemove]);
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    async function onSubmit(values: AddVehicleValues) {
        setIsSubmitting(true);
        const formData = new FormData();

        try {
            formData.append('purchase_price', values.purchase_price);
            formData.append('retail_price', values.retail_price);
            formData.append('status_id', values.status_id);
            formData.append('transmission_type_id', values.transmission_type_id);
            formData.append('fuel_type_id', values.fuel_type_id);
            formData.append('body_style_id', values.body_style_id);
            formData.append('traction_type_id', values.traction_type_id);
            formData.append('make', values.make);
            formData.append('model', values.model);
            formData.append('version', values.version || "");
            formData.append('license_plate', values.license_plate);
            formData.append('mileage', values.mileage);
            formData.append('color', values.color);
            formData.append('seats', values.seats);
            formData.append('doors', values.doors);
            formData.append('power', values.power);
            formData.append('engine_size', values.engine_size);
            formData.append('year', values.year);

            if (selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            await api.post('/admin/vehicles/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            router.push('/admin/vehicles');
            router.refresh();
        } catch (error) {
            console.error("Erro ao criar veículo:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex-1 py-10 px-4 bg-gray-50/50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between pb-4">
                    <div className="space-y-1">
                        <Link href="/admin/vehicles">
                            <Button variant="ghost" className="p-0 h-auto gap-1 text-muted-foreground hover:text-primary mb-2">
                                <ChevronLeft className="size-4" /> Voltar à lista
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Novo Veículo</h1>
                        <p className="text-muted-foreground">Registo de entrada de stock.</p>
                    </div>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Guardar Veículo"}
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* 1. Dados Principais */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-md text-blue-600"><Info className="size-5" /></div>
                                    <CardTitle>Informação Geral</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField control={form.control} name="make" render={({ field }) => (
                                    <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: BMW" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="model" render={({ field }) => (
                                    <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: Série 3" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="year" render={({ field }) => (
                                    <FormItem><FormLabel>Ano</FormLabel><FormControl><div className="relative"><Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" placeholder="2024" {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="status_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                {/* w-full aplicado aqui */}
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{status?.map((opt) => (<SelectItem key={opt?.id} value={String(opt?.id)}>{opt?.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="version" render={({ field }) => (
                                    <FormItem className="md:col-span-2"><FormLabel>Versão</FormLabel><FormControl><Input placeholder="Ex: 320d Touring Pack M" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="license_plate" render={({ field }) => (
                                    <FormItem><FormLabel>Matrícula</FormLabel><FormControl><div className="relative"><CarFront className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 uppercase font-mono" placeholder="AA-00-AA" maxLength={8} {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="color" render={({ field }) => (
                                    <FormItem><FormLabel>Cor</FormLabel><FormControl><Input placeholder="Ex: Preto" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        {/* 2. Especificações e Categorias */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 rounded-md text-orange-600"><Settings className="size-5" /></div>
                                    <CardTitle>Especificações & Motorização</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                {/* Categorias - Com w-full nos SelectTriggers */}
                                <FormField control={form.control} name="body_style_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carroçaria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{bodyStyle?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="fuel_type_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Combustível</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{fuelType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="transmission_type_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transmissão</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{transmissionType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="traction_type_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tração</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{tractionType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {/* Specs Numéricas */}
                                <FormField control={form.control} name="mileage" render={({ field }) => (
                                    <FormItem><FormLabel>Quilómetros</FormLabel><FormControl><div className="relative"><Gauge className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="power" render={({ field }) => (
                                    <FormItem><FormLabel>Potência (cv)</FormLabel><FormControl><div className="relative"><Zap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="engine_size" render={({ field }) => (
                                    <FormItem><FormLabel>Cilindrada (cc)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="seats" render={({ field }) => (
                                        <FormItem><FormLabel>Lugares</FormLabel><FormControl><div className="relative"><Armchair className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="doors" render={({ field }) => (
                                        <FormItem><FormLabel>Portas</FormLabel><FormControl><div className="relative"><DoorOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Financeiro */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-100 rounded-md text-green-600"><Banknote className="size-5" /></div>
                                    <CardTitle>Financeiro</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="purchase_price" render={({ field }) => (
                                    <FormItem><FormLabel>Preço de Compra</FormLabel><FormControl><div className="relative"><Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" placeholder="0.00" {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="retail_price" render={({ field }) => (
                                    <FormItem><FormLabel className="text-primary font-semibold">Preço de Venda</FormLabel><FormControl><div className="relative"><Euro className="absolute left-3 top-2.5 h-4 w-4 text-primary" /><Input type="number" className="pl-9 font-semibold border-primary/20 focus-visible:ring-primary/30" placeholder="0.00" {...field} /></div></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        {/* 4. Imagens */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-md text-purple-600"><ImageIcon className="size-5" /></div>
                                    <CardTitle>Galeria</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/25 hover:border-primary/50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground font-medium">Carregar Fotos</p>
                                        </div>
                                        <Input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>

                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {previews.map((src, index) => (
                                                <div key={index} className="relative aspect-[4/3] rounded-md overflow-hidden border bg-background shadow-sm group">
                                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                                    <Image fill src={src} alt={`Preview ${index}`} className="object-cover" />
                                                    {index === 0 && <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] py-1 text-center font-bold uppercase">Capa</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4 pb-10">
                            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white min-w-[200px]">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Publicar Veículo"}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </main>
    );
}