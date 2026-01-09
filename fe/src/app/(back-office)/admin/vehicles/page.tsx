'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Search, Car } from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Vehicle, VehicleSchema } from "@/schemas/Vehicle";
import z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SellVehicleDialog } from "@/components/app/SellVehicleDialog";

function formatPrice(price: string): string {
  const numericPrice = parseFloat(price);
  
  if (isNaN(numericPrice)) return "0,00 €";

  return numericPrice.toLocaleString('pt-PT', { 
    style: 'currency', 
    currency: 'EUR', 
    minimumFractionDigits: 2 
  });
}

export default function AdminVehiclesPage() {

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get('/admin/vehicles/');

                const validatedData = z.array(VehicleSchema).parse(response.data);
                setVehicles(validatedData);

            } catch (error) {
                console.error("Erro ao carregar veículos:", error);
            }
        }

        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/admin/vehicles/${id}/`);

            setVehicles((prev) => prev.filter((v) => v.id !== id));
        } catch (error) {
            console.error("Erro ao eliminar:", error);
        }
    };

    const handleSale = async (id: number, finalPrice: string) => {
        try {
            await api.post(`/admin/vehicles/${id}/mark_sold/`, {
                final_price: finalPrice
            });

            setVehicles((prev) => prev.map(vehicle => {
                if (vehicle.id === id) {
                    return {
                        ...vehicle,
                        retail_price: finalPrice, 
                        status: { ...vehicle.status, name: 'Vendido'}
                    };
                }
                return vehicle;
            }));
        } catch (error) {
            console.error("Erro ao registar venda:", error);
            alert("Erro ao registar venda.");
        }
    };

    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredVehicles = vehicles.filter(v => 
        v.vehicle_data.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.vehicle_data.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_data.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Car className="size-8 text-red-600" />
                        Gestão de Stock
                    </h1>
                    <p className="text-muted-foreground">Visão geral do inventário e ações administrativas.</p>
                </div>
                
                <Link href="/admin/vehicles/new" passHref>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                        <PlusCircle className="size-5" />
                        Adicionar Novo
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Inventário Completo</CardTitle>
                    <CardDescription>
                        Total de {vehicles.length} veículos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por marca, modelo ou matrícula..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead>
                                <tr>
                                    {['ID', 'Matrícula', 'Marca/Modelo', 'Status', 'Custo', 'Venda', 'Ações'].map(header => (
                                        <th 
                                            key={header} 
                                            className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{vehicle.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{vehicle.vehicle_data.license_plate}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{vehicle.vehicle_data.make} {vehicle.vehicle_data.model} {vehicle.vehicle_data.year}</td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <span 
                                                className={`inline-flex px-2 py-0.5 text-xs font-semibold leading-5 rounded-full ${
                                                    vehicle.status.name === 'Disponível' ? 'bg-green-100 text-green-800' :
                                                    vehicle.status.name === 'Reservado' ? 'bg-yellow-100 text-yellow-800' :
                                                    vehicle.status.name === 'Vendido' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {vehicle.status.name}
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                            {formatPrice(vehicle.purchase_price)}
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                                            {formatPrice(vehicle.retail_price)}
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">                                      
                                            <Link href={`/admin/vehicles/${vehicle.id}/edit`} passHref>
                                                <Button variant="ghost" size="sm" title="Editar Veículo">
                                                    <Edit className="size-4 text-primary" />
                                                </Button>
                                            </Link>
       
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600">
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o veículo 
                                                            <span className="font-bold text-foreground"> {vehicle.vehicle_data.make} {vehicle.vehicle_data.model} ({vehicle.vehicle_data.license_plate}) </span>
                                                            e remover todos os dados associados dos servidores.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => handleDelete(vehicle.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            Eliminar Veículo
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            {vehicle.status.name !== 'Vendido' && (
                                                <SellVehicleDialog 
                                                    vehicle={vehicle} 
                                                    onConfirm={handleSale} 
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredVehicles.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Nenhum veículo encontrado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}