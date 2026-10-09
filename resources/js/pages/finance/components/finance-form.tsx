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
import { index, store, update } from '@/routes/finance';

export type FinanceFormValues = {
    invoice_number: string;
    title: string;
    description: string;
    type: 'invoice' | 'quote' | 'expense';
    currency: 'USD' | 'SOS';
    amount: string;
    paid_amount: string;
    balance: string;
    due_date: string;
    paid_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    property_id: string;
    unit_id: string;
    tenant_id: string;
    recipient_name: string;
    recipient_email: string;
    notes: string;
};
type PropertyOption = { id: number; name: string };
type UnitOption = { id: number; unit_number: string };
type TenantOption = { id: number; first_name: string; last_name: string };
const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export function FinanceForm({
    mode,
    finance,
    properties,
    units,
    tenants,
}: {
    mode: 'create' | 'edit';
    finance?: FinanceFormValues & { id: number };
    properties: PropertyOption[];
    units: UnitOption[];
    tenants: TenantOption[];
}) {
    const form = useForm<FinanceFormValues>({
        invoice_number: finance?.invoice_number ?? '',
        title: finance?.title ?? '',
        description: finance?.description ?? '',
        type: finance?.type ?? 'invoice',
        currency: finance?.currency ?? 'USD',
        amount: finance?.amount ?? '0',
        paid_amount: finance?.paid_amount ?? '0',
        balance: finance?.balance ?? '0',
        due_date: finance?.due_date ?? '',
        paid_date: finance?.paid_date ?? '',
        status: finance?.status ?? 'draft',
        property_id: finance?.property_id ? String(finance.property_id) : '',
        unit_id: finance?.unit_id ? String(finance.unit_id) : '',
        tenant_id: finance?.tenant_id ? String(finance.tenant_id) : '',
        recipient_name: finance?.recipient_name ?? '',
        recipient_email: finance?.recipient_email ?? '',
        notes: finance?.notes ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data: Partial<FinanceFormValues> = { ...form.data };
        if (!data.property_id) delete data.property_id;
        if (!data.unit_id) delete data.unit_id;
        if (!data.tenant_id) delete data.tenant_id;
        if (!data.recipient_name) delete data.recipient_name;
        if (!data.recipient_email) delete data.recipient_email;
        if (!data.due_date) delete data.due_date;
        if (!data.paid_date) delete data.paid_date;
        if (!data.notes) delete data.notes;
        form.transform(() => data);
        if (mode === 'create') {
            form.post(store.url());
        } else {
            form.put(update.url(finance!.id));
        }
    };
    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Finance record details</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Invoice information, amounts and payment status.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <Field
                        label="Invoice number"
                        value={form.data.invoice_number}
                        onChange={(value) =>
                            form.setData('invoice_number', value)
                        }
                        error={form.errors.invoice_number}
                    />
                    <Field
                        label="Title"
                        value={form.data.title}
                        onChange={(value) => form.setData('title', value)}
                        error={form.errors.title}
                    />
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={form.data.type}
                            onValueChange={(value) =>
                                form.setData('type', value as any)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['invoice', 'quote', 'expense'].map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.type} />
                    </div>
                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                            value={form.data.currency}
                            onValueChange={(value) =>
                                form.setData('currency', value as any)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['USD', 'SOS'].map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                        {currency}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.currency} />
                    </div>
                    <Field
                        label="Amount"
                        type="number"
                        step="0.01"
                        value={form.data.amount}
                        onChange={(value) => form.setData('amount', value)}
                        error={form.errors.amount}
                    />
                    <Field
                        label="Paid amount"
                        type="number"
                        step="0.01"
                        value={form.data.paid_amount}
                        onChange={(value) => form.setData('paid_amount', value)}
                        error={form.errors.paid_amount}
                    />
                    <Field
                        label="Balance"
                        type="number"
                        step="0.01"
                        value={form.data.balance}
                        onChange={(value) => form.setData('balance', value)}
                        error={form.errors.balance}
                    />
                    <Field
                        label="Due date"
                        type="date"
                        value={form.data.due_date}
                        onChange={(value) => form.setData('due_date', value)}
                        error={form.errors.due_date}
                    />
                    <Field
                        label="Paid date"
                        type="date"
                        value={form.data.paid_date}
                        onChange={(value) => form.setData('paid_date', value)}
                        error={form.errors.paid_date}
                    />
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData('status', value as any)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    'draft',
                                    'sent',
                                    'paid',
                                    'overdue',
                                    'cancelled',
                                ].map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <div className="space-y-2">
                        <Label>Property</Label>
                        <Select
                            value={form.data.property_id}
                            onValueChange={(value) =>
                                form.setData('property_id', value)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                                {properties.map((property) => (
                                    <SelectItem
                                        key={property.id}
                                        value={String(property.id)}
                                    >
                                        {property.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.property_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select
                            value={form.data.unit_id}
                            onValueChange={(value) =>
                                form.setData('unit_id', value)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem
                                        key={unit.id}
                                        value={String(unit.id)}
                                    >
                                        {unit.unit_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.unit_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tenant</Label>
                        <Select
                            value={form.data.tenant_id}
                            onValueChange={(value) =>
                                form.setData('tenant_id', value)
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue placeholder="Select tenant" />
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map((tenant) => (
                                    <SelectItem
                                        key={tenant.id}
                                        value={String(tenant.id)}
                                    >
                                        {tenant.first_name} {tenant.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.tenant_id} />
                    </div>
                    <Field
                        label="Recipient name"
                        value={form.data.recipient_name}
                        onChange={(value) =>
                            form.setData('recipient_name', value)
                        }
                        error={form.errors.recipient_name}
                    />
                    <Field
                        label="Recipient email"
                        type="email"
                        value={form.data.recipient_email}
                        onChange={(value) =>
                            form.setData('recipient_email', value)
                        }
                        error={form.errors.recipient_email}
                    />
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            className="min-h-[120px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Notes</Label>
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
                    Save changes
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
    step,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    step?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                step={step}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            />
            <InputError message={error} />
        </div>
    );
}
