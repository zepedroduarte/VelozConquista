// components/app/FilterAccordion.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Option } from "@/context/VehicleOptionsContext";

interface FilterAccordionProps {
    title: string;
    valueKey: string; 
    options: Option[];
    selectedValues: number[];
    onToggle: (id: number) => void;
}

export function FilterAccordion({ title, valueKey, options, selectedValues, onToggle }: FilterAccordionProps) {
    if (!options || options.length === 0) return null;

    return (
        <Accordion type="single" collapsible className="w-full border rounded-lg bg-white shadow-sm px-4">
            <AccordionItem value={valueKey} className="border-none">
                <AccordionTrigger className="hover:no-underline py-3 text-sm font-semibold text-gray-800">
                    {title}
                    {selectedValues.length > 0 && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-600">
                            {selectedValues.length}
                        </span>
                    )}
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 pt-1 pb-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {options.map((option) => {
                            const isChecked = selectedValues.includes(option.id);
                            return (
                                <div key={option.id} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={`${valueKey}-${option.id}`} 
                                        checked={isChecked}
                                        onCheckedChange={() => onToggle(option.id)}
                                        className="size-4 border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                    />
                                    <Label 
                                        htmlFor={`${valueKey}-${option.id}`} 
                                        className="text-sm font-normal cursor-pointer text-gray-600 hover:text-gray-900"
                                    >
                                        {option.name}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}