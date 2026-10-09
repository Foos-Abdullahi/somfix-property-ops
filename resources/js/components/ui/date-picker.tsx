import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({ label, value, onChange, min, max }: { label: string; value: string; onChange: (value: string) => void; min?: string; max?: string }) {
    const [open, setOpen] = useState(false);
    const selected = value ? new Date(value + 'T00:00:00') : undefined;
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><Button type="button" variant="outline" className="h-9 justify-start rounded-lg font-normal" aria-label={`${label}: ${value || 'Any date'}`}><CalendarIcon className="size-4" />{selected ? `${label}: ${selected.toLocaleDateString()}` : label}</Button></PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
            <Calendar mode="single" selected={selected} defaultMonth={selected} autoFocus disabled={[...(min ? [{ before: new Date(min + 'T00:00:00') }] : []), ...(max ? [{ after: new Date(max + 'T00:00:00') }] : [])]} onSelect={(date) => { onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''); setOpen(false); }} />
            <Button type="button" variant="ghost" className="mb-2 w-full" onClick={() => { onChange(''); setOpen(false); }}>Clear date</Button>
        </PopoverContent>
    </Popover>;
}
