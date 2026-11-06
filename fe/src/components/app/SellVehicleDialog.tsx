import { Vehicle } from "@/schemas/Vehicle";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatEuro } from "@/lib/admin";

export interface SaleData {
    final_price: string;
    /** Comissão da financeira (vazio = sem financiamento) */
    commission: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_nif: string;
    notes: string;
}

export function SellVehicleDialog({ vehicle, onConfirm }: { vehicle: Vehicle, onConfirm: (id: number, sale: SaleData) => void }) {
    const [sale, setSale] = useState<SaleData>({
        final_price: vehicle.retail_price.toString(),
        commission: "",
        customer_name: "", customer_phone: "", customer_email: "", customer_nif: "", notes: "",
    });

    const set = (key: keyof SaleData) => (e: React.ChangeEvent<HTMLInputElement>) => setSale({ ...sale, [key]: e.target.value });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground text-green-600 hover:text-green-700" title="Registar Venda">
                    <DollarSign className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Registar Venda</AlertDialogTitle>
                    <AlertDialogDescription>
                        A confirmar a venda de:
                        <span className="font-bold text-foreground block mt-1">
                            {vehicle.vehicle_data.make} {vehicle.vehicle_data.model} ({vehicle.vehicle_data.license_plate})
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Valor final de venda (€)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-muted-foreground">€</span>
                            <Input type="number" inputMode="decimal" className="pl-8 font-bold" value={sale.final_price} onChange={set("final_price")} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Preço anunciado: {formatEuro(vehicle.retail_price)} · Preço de compra: {formatEuro(vehicle.purchase_price)}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Comissão de financiamento (€) <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-muted-foreground">€</span>
                            <Input type="number" inputMode="decimal" min="0" step="0.01" className="pl-8" placeholder="0" value={sale.commission} onChange={set("commission")} />
                        </div>
                        <p className="text-xs text-muted-foreground">Se ainda não sabe o valor, pode acrescentá-lo depois no Registo de Vendas.</p>
                    </div>

                    <div className="space-y-3 rounded-md border p-3">
                        <p className="text-sm font-medium">Cliente <span className="font-normal text-muted-foreground">(opcional)</span></p>
                        <Input placeholder="Nome" value={sale.customer_name} onChange={set("customer_name")} />
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="tel" placeholder="Telefone" value={sale.customer_phone} onChange={set("customer_phone")} />
                            <Input inputMode="numeric" placeholder="NIF" value={sale.customer_nif} onChange={set("customer_nif")} />
                        </div>
                        <Input type="email" placeholder="Email" value={sale.customer_email} onChange={set("customer_email")} />
                    </div>

                    <Input placeholder="Notas (ex.: retoma, financiamento...)" value={sale.notes} onChange={set("notes")} />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm(vehicle.id, sale)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirmar Venda
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
