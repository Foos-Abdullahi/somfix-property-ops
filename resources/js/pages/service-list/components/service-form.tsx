import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index, store, update } from '@/routes/service-list';

export type ServiceFormValues = {
    name: string;
    category: string;
    description: string;
    unit: string;
    price: string;
    duration: string;
    status: 'active' | 'inactive';
    notes: string;
};

type ServiceRecord = {
    [K in keyof ServiceFormValues]: ServiceFormValues[K] | null;
} & { id: number };

const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export function ServiceForm({
    mode,
    service,
    categories,
}: {
    mode: 'create' | 'edit';
    service?: ServiceRecord;
    categories: string[];
}) {
    const form = useForm<ServiceFormValues>({
        name: service?.name ?? '',
        category: service?.category ?? '',
        description: service?.description ?? '',
        unit: service?.unit ?? '',
        price: service?.price ?? '',
        duration: service?.duration ?? '',
        status: service?.status ?? 'active',
        notes: service?.notes ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mode === 'create') {
            form.post(store.url());
        } else {
            form.put(update.url(service!.id));
        }
    };
    const set = (key: keyof ServiceFormValues) => (value: string) =>
        form.setData(key, value as never);
    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Service details</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        A service SOMFIX offers. It is not linked to any
                        customer, tenant or property.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <Field
                        label="Service name"
                        value={form.data.name}
                        onChange={set('name')}
                        error={form.errors.name}
                        placeholder="e.g. Water tank cleaning"
                    />
                    <Field
                        label="Category"
                        value={form.data.category}
                        onChange={set('category')}
                        error={form.errors.category}
                        placeholder="e.g. Plumbing"
                        list="service-categories"
                    />
                    <datalist id="service-categories">
                        {categories.map((category) => (
                            <option key={category} value={category} />
                        ))}
                    </datalist>
                    <Field
                        label="Price (USD, optional)"
                        type="number"
                        value={form.data.price}
                        onChange={set('price')}
                        error={form.errors.price}
                    />
                    <Field
                        label="Pricing unit (optional)"
                        value={form.data.unit}
                        onChange={set('unit')}
                        error={form.errors.unit}
                        placeholder="e.g. per visit, per hour, per m²"
                    />
                    <Field
                        label="Estimated duration (optional)"
                        value={form.data.duration}
                        onChange={set('duration')}
                        error={form.errors.duration}
                        placeholder="e.g. 2 hours"
                    />
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={set('status')}
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">ACTIVE</SelectItem>
                                <SelectItem value="inactive">
                                    INACTIVE
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Internal notes</Label>
                        <Textarea
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>
            </section>
            <div className="flex items-center justify-end gap-2">
                <Button asChild variant="outline" type="button">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back
                    </Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    <Save />
                    Save service
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    list,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    list?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                placeholder={placeholder}
                list={list}
                min={type === 'number' ? 0 : undefined}
                step={type === 'number' ? '0.01' : undefined}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            />
            <InputError message={error} />
        </div>
    );
}
