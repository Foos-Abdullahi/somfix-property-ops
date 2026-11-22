import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type CustomerOption = { id: number; name: string; email: string | null; phone: string | null; address: string | null };

/**
 * Bill-to picker for customers (people who buy SOMFIX maintenance/repair work).
 * Tenants live in the property side; customers are the sales side. Picking one fills the recipient.
 */
export function CustomerPicker({ customers, onPick, className }: { customers: CustomerOption[]; onPick: (customer: CustomerOption | null) => void; className?: string }) {
    const [value, setValue] = useState('');
    return (
        <div className="space-y-2">
            <Label>Select Customer</Label>
            <Select
                value={value}
                onValueChange={(v) => {
                    const next = v === 'none' ? '' : v;
                    setValue(next);
                    onPick(customers.find((c) => String(c.id) === next) ?? null);
                }}
            >
                <SelectTrigger className={`w-full ${className ?? ''}`}>
                    <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">No customer</SelectItem>
                    {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                            {c.phone ? ` · ${c.phone}` : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Sales customers fill the bill-to details. Use tenant below for property tenants.</p>
        </div>
    );
}
