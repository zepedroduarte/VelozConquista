import type { ComponentType } from 'react';

export function DetailItem({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>, label: string, value: string | number }) {
    return (
        <div className="flex items-center gap-4 border-l-2 border-primary pl-4">
            <Icon className="size-6 text-primary shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold text-lg">{value}</p>
            </div>
        </div>
    );
}