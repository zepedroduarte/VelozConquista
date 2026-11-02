'use client'

import { useState, useEffect, use } from "react"; // <--- ADICIONAR 'use'
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from '@/lib/axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Upload, Euro, CarFront, Gauge, Zap, DoorOpen, Armchair, X, Calendar, Info, Settings, Banknote, ImageIcon, Trash2, Star } from "lucide-react";
import { useVehicleOptions } from "@/context/VehicleOptionsContext";
import Image from 'next/image';
import { resizeImageForUpload } from "@/lib/resize-image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const VehicleSchema = z.object({
  make: z.string().min(1, "Obrigatório"),
  model: z.string().min(1, "Obrigatório"),
  version: z.string().optional(),
  license_plate: z.string().min(1, "Obrigatório"),
  mileage: z.string().refine(val => !isNaN(parseFloat(val)), "Inválido"),
  color: z.string().min(1, "Obrigatório"),
  seats: z.string().refine(val => !isNaN(parseInt(val)), "Inválido"),
  doors: z.string().refine(val => !isNaN(parseInt(val)), "Inválido"),
  power: z.string().refine(val => !isNaN(parseFloat(val)), "Inválido"),
  engine_size: z.string().refine(val => !isNaN(parseFloat(val)), "Inválido"),
  transmission_type_id: z.string().min(1, "Obrigatório"),
  fuel_type_id: z.string().min(1, "Obrigatório"),
  body_style_id: z.string().min(1, "Obrigatório"),
  traction_type_id: z.string().min(1, "Obrigatório"),
  status_id: z.string().min(1, "Obrigatório"),
  purchase_price: z.string().refine(val => !isNaN(parseFloat(val)), "Inválido"),
  retail_price: z.string().refine(val => !isNaN(parseFloat(val)), "Inválido"),
  year: z.string().refine(val => !isNaN(parseInt(val)), "Ano inválido"),
  images: z.any().optional(), 
});

type VehicleValues = z.infer<typeof VehicleSchema>;

type ExistingImage = {
    id: number;
    image: string;
    is_primary: boolean;
};

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    
    const { id } = use(params);

    const { fuelType, transmissionType, bodyStyle, tractionType, status } = useVehicleOptions();
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [newPrimaryIndex, setNewPrimaryIndex] = useState<number | null>(null);

    const form = useForm<VehicleValues>({
        resolver: zodResolver(VehicleSchema),
        defaultValues: {
            make: "", model: "", version: "", license_plate: "", mileage: "", color: "",
            seats: "", doors: "", power: "", engine_size: "", year: "",
            transmission_type_id: "", fuel_type_id: "", body_style_id: "", traction_type_id: "", status_id: "",
            purchase_price: "", retail_price: "",
        },
    });

    useEffect(() => {
        async function fetchVehicle() {
            try {
                const response = await api.get(`/admin/vehicles/${id}/`);
                const data = response.data;
                const vData = data.vehicle_data;

                form.reset({
                    make: vData.make,
                    model: vData.model,
                    version: vData.version || "",
                    license_plate: vData.license_plate,
                    mileage: String(vData.mileage),
                    color: vData.color,
                    seats: String(vData.seats),
                    doors: String(vData.doors),
                    power: String(vData.power),
                    engine_size: String(vData.engine_size),
                    year: String(vData.year || ""),
                    
                    transmission_type_id: String(vData.transmission_type.id),
                    fuel_type_id: String(vData.fuel_type.id),
                    body_style_id: String(vData.body_style.id),
                    traction_type_id: String(vData.traction_type?.id || ""),
                    status_id: String(data.status.id),
                    
                    purchase_price: String(data.purchase_price),
                    retail_price: String(data.retail_price),
                });

                if (vData.images) setExistingImages(vData.images);

            } catch (error) {
                console.error("Erro ao carregar veículo:", error);
            } finally {
                setIsLoading(false);
            }
        }
        if (id) fetchVehicle();
    }, [id, form]);

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
        e.target.value = ""; 
    };

    const removeNewImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const deleteExistingImage = async (imageId: number) => {
        try {
            await api.delete(`/admin/vehicle-images/${imageId}/`); 
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error("Erro ao apagar imagem:", error);
            alert("Erro ao apagar imagem. Tente novamente.");
        }
    };

    const setExistingPrimary = async (imageId: number) => {
        try {
            await api.post(`/admin/vehicle-images/${imageId}/set_primary/`);
            setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
            setNewPrimaryIndex(null);
        } catch (error) {
            console.error("Erro ao definir imagem principal:", error);
        }
    };

    async function onSubmit(values: VehicleValues) {
        setIsSubmitting(true);
        const formData = new FormData();

        try {
            formData.append('purchase_price', values.purchase_price);
            formData.append('retail_price', values.retail_price);
            formData.append('status_id', values.status_id);
            
            formData.append('make', values.make);
            formData.append('model', values.model);
            formData.append('year', values.year);
            formData.append('version', values.version || "");
            formData.append('license_plate', values.license_plate);
            formData.append('mileage', values.mileage);
            formData.append('color', values.color);
            formData.append('seats', values.seats);
            formData.append('doors', values.doors);
            formData.append('power', values.power);
            formData.append('engine_size', values.engine_size);
            
            formData.append('transmission_type_id', values.transmission_type_id);
            formData.append('fuel_type_id', values.fuel_type_id);
            formData.append('body_style_id', values.body_style_id);
            formData.append('traction_type_id', values.traction_type_id);

            if (selectedFiles.length > 0) {
                const resizedFiles = await Promise.all(selectedFiles.map(resizeImageForUpload));
                resizedFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            await api.put(`/admin/vehicles/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            router.push('/admin/vehicles');
            router.refresh();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao guardar alterações.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <main className="flex-1 py-10 px-4 bg-gray-50/50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-4">
                    <div className="space-y-1">
                        <Link href="/admin/vehicles">
                            <Button variant="ghost" className="p-0 h-auto gap-1 text-muted-foreground hover:text-primary mb-2">
                                <ChevronLeft className="size-4" /> Voltar à lista
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editar Veículo</h1>
                        <p className="text-muted-foreground">Alterar dados do veículo #{id}</p>
                    </div>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Guardar Alterações"}
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-md text-blue-600"><Info className="size-5" /></div>
                                    <CardTitle>Informação Geral</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField control={form.control} name="make" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Ano</FormLabel><FormControl><div className="relative"><Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="status_id" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{status?.map((opt) => (<SelectItem key={opt?.id} value={String(opt?.id)}>{opt?.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="version" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Versão</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="license_plate" render={({ field }) => (<FormItem><FormLabel>Matrícula</FormLabel><FormControl><div className="relative"><CarFront className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 uppercase font-mono" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Cor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 rounded-md text-orange-600"><Settings className="size-5" /></div>
                                    <CardTitle>Especificações & Motorização</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <FormField control={form.control} name="body_style_id" render={({ field }) => (<FormItem><FormLabel>Carroçaria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent>{bodyStyle?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fuel_type_id" render={({ field }) => (<FormItem><FormLabel>Combustível</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent>{fuelType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="transmission_type_id" render={({ field }) => (<FormItem><FormLabel>Transmissão</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent>{transmissionType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="traction_type_id" render={({ field }) => (<FormItem><FormLabel>Tração</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent>{tractionType?.map((o) => <SelectItem key={o?.id} value={String(o?.id)}>{o?.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="mileage" render={({ field }) => (<FormItem><FormLabel>Quilómetros</FormLabel><FormControl><div className="relative"><Gauge className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="power" render={({ field }) => (<FormItem><FormLabel>Potência (cv)</FormLabel><FormControl><div className="relative"><Zap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="engine_size" render={({ field }) => (<FormItem><FormLabel>Cilindrada (cc)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="seats" render={({ field }) => (<FormItem><FormLabel>Lugares</FormLabel><FormControl><div className="relative"><Armchair className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="doors" render={({ field }) => (<FormItem><FormLabel>Portas</FormLabel><FormControl><div className="relative"><DoorOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-100 rounded-md text-green-600"><Banknote className="size-5" /></div>
                                    <CardTitle>Financeiro</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="purchase_price" render={({ field }) => (<FormItem><FormLabel>Preço de Compra</FormLabel><FormControl><div className="relative"><Euro className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="retail_price" render={({ field }) => (<FormItem><FormLabel className="text-primary font-semibold">Preço de Venda</FormLabel><FormControl><div className="relative"><Euro className="absolute left-3 top-2.5 h-4 w-4 text-primary" /><Input type="number" className="pl-9 font-semibold border-primary/20 focus-visible:ring-primary/30" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-md text-purple-600"><ImageIcon className="size-5" /></div>
                                    <CardTitle>Galeria</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {existingImages.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Imagens Atuais</h4>
                                        <p className="text-xs text-muted-foreground mb-3">Clique na estrela para definir a imagem principal. Clique na imagem para ampliar.</p>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {existingImages.map((img) => (
                                                <div key={img.id} className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 bg-background shadow-sm group transition-all ${img.is_primary ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-border'}`}>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button type="button" className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Apagar imagem?</AlertDialogTitle><AlertDialogDescription>Esta imagem será removida permanentemente.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteExistingImage(img.id)} className="bg-red-600 text-white">Apagar</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <button type="button" onClick={() => setExistingPrimary(img.id)} className={`absolute top-1 left-1 z-10 p-1 rounded-full transition-all ${img.is_primary ? 'bg-amber-400 text-white' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'}`}>
                                                        <Star className={`w-3 h-3 ${img.is_primary ? 'fill-white' : ''}`} />
                                                    </button>
                                                    <div className="cursor-pointer w-full h-full" onClick={() => setLightboxSrc(img?.image)}>
                                                        <Image fill src={img?.image} alt="Veículo" className="object-cover" />
                                                    </div>
                                                    {img.is_primary && <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 text-white text-[10px] py-1 text-center font-bold uppercase">Principal</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Adicionar Novas</h4>
                                    <div className="space-y-4">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/25 hover:border-primary/50">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground font-medium">Carregar Mais Fotos</p>
                                            </div>
                                            <Input type="file" multiple className="hidden" accept="image/*" onChange={handleNewImageChange} />
                                        </label>
                                        {previews.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {previews.map((src, index) => (
                                                    <div key={index} className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 bg-background shadow-sm group transition-all ${newPrimaryIndex === index ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-border'}`}>
                                                        <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                                        <div className="cursor-pointer w-full h-full" onClick={() => setLightboxSrc(src)}>
                                                            <Image fill src={src} alt={`New Preview ${index}`} className="object-cover" />
                                                        </div>
                                                        <div className="absolute inset-x-0 bottom-0 bg-green-600/80 text-white text-[10px] py-1 text-center font-bold uppercase">Nova</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {lightboxSrc && (
                            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
                                <button type="button" onClick={() => setLightboxSrc(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                                <img src={lightboxSrc} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                            </div>
                        )}

                        <div className="flex justify-end pt-4 pb-10">
                            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Guardar...</> : "Guardar Alterações"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </main>
    );
}