import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({ label, value, onChange, min, max, className }: { label: string; value: string; onChange: (value: string) => void; min?: string; max?: string; className?: string }) {
    const [open, setOpen] = useState(false);
    const selected = toCalendarDate(value);
    const minDate = toCalendarDate(min);
    const maxDate = toCalendarDate(max);
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild><Button type="button" variant="outline" className={`h-9 justify-start rounded-lg font-normal ${className ?? ''}`} aria-label={`${label}: ${value || 'Any date'}`}><CalendarIcon className="size-4" />{selected ? `${label}: ${selected.toLocaleDateString()}` : label}</Button></PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
            <Calendar mode="single" selected={selected} defaultMonth={selected} autoFocus disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]} onSelect={(date) => { onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''); setOpen(false); }} />
            <Button type="button" variant="ghost" className="mb-2 w-full" onClick={() => { onChange(''); setOpen(false); }}>Clear date</Button>
        </PopoverContent>
    </Popover>;
}

function toCalendarDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return undefined;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? undefined : date;
}
