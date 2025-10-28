// fe/src/app/(admin-layout)/admin/vehicles/page.tsx
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Search, DollarSign, Car } from "lucide-react";
import React from "react";

const MOCK_ADMIN_VEHICLES = [
    { id: 1, make: "Mercedes-Benz", model: "C 220d", license: "01-AA-01", status: "Disponível", retailPrice: 34599.00, purchasePrice: 28000.00 },
    { id: 2, make: "BMW", model: "Série 3 320i", license: "02-BB-02", status: "Reservado", retailPrice: 28999.00, purchasePrice: 22000.00 },
    { id: 3, make: "Renault", model: "Clio 1.0", license: "03-CC-03", status: "Vendido", retailPrice: 13500.00, purchasePrice: 9000.00 },
    { id: 4, make: "Audi", model: "A4 Avant", license: "04-DD-04", status: "Preparação", retailPrice: 38000.00, purchasePrice: 30000.00 },
];

function formatPrice(price: number): string {
    return price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}


export default function AdminVehiclesPage() {
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredVehicles = MOCK_ADMIN_VEHICLES.filter(v => 
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.license.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Total de {MOCK_ADMIN_VEHICLES.length} veículos.
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
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{vehicle.license}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{vehicle.make} {vehicle.model}</td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <span 
                                                className={`inline-flex px-2 py-0.5 text-xs font-semibold leading-5 rounded-full ${
                                                    vehicle.status === 'Disponível' ? 'bg-green-100 text-green-800' :
                                                    vehicle.status === 'Reservado' ? 'bg-yellow-100 text-yellow-800' :
                                                    vehicle.status === 'Vendido' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                            {formatPrice(vehicle.purchasePrice)}
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                                            {formatPrice(vehicle.retailPrice)}
                                        </td>
                                        
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                            <Button variant="ghost" size="sm" title="Vender/Registar Venda">
                                                <DollarSign className="size-4 text-green-600" />
                                            </Button>
                                            <Link href={`/admin/vehicles/${vehicle.id}/edit`} passHref>
                                                <Button variant="ghost" size="sm" title="Editar Veículo">
                                                    <Edit className="size-4 text-primary" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" title="Eliminar Veículo">
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
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