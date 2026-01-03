import { Vehicle } from "@/schemas/Vehicle";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function formatPrice(price: string): string {
  const numericPrice = parseFloat(price);
  
  if (isNaN(numericPrice)) return "0,00 €";

  return numericPrice.toLocaleString('pt-PT', { 
    style: 'currency', 
    currency: 'EUR', 
    minimumFractionDigits: 2 
  });
}

export function SellVehicleDialog({ vehicle, onConfirm }: { vehicle: Vehicle, onConfirm: (id: number, price: string) => void }) {
    const [price, setPrice] = useState(vehicle.retail_price.toString());

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground text-green-600 hover:text-green-700" title="Registar Venda">
                    <DollarSign className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Registar Venda</AlertDialogTitle>
                    <AlertDialogDescription>
                        A confirmar a venda de: 
                        <span className="font-bold text-foreground block mt-1">
                            {vehicle.vehicle_data.make} {vehicle.vehicle_data.model} ({vehicle.vehicle_data.license_plate})
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Valor Final de Venda (€):</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                        <Input 
                            type="number" 
                            className="pl-8 font-bold"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        O valor original era: {formatPrice(vehicle.retail_price.toString())}
                    </p>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => onConfirm(vehicle.id, price)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirmar Venda
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}