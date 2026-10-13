import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Building2, User, FileText } from 'lucide-react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { index, store } from '@/routes/finance';

type PropertyOption = { id: number; name: string };
type UnitOption = { id: number; unit_number: string };
type TenantOption = { id: number; first_name: string; last_name: string };

type LineItem = {
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
};

type QuoteFormValues = {
    invoice_number: string;
    title: string;
    description: string;
    type: 'quote';
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
    _line_items: string;
    _recipient_address: string;
    _company_name: string;
    _company_address: string;
    _company_phone: string;
    _company_email: string;
    _valid_until: string;
    _terms_conditions: string;
};

const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

function generateQuoteNumber() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `QUO-${y}${m}-${rand}`;
}

function computeAmount(items: LineItem[]): string {
    const total = items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
    return total.toFixed(2);
}

export default function CreateQuotePage({
    properties,
    units,
    tenants,
}: {
    properties: PropertyOption[];
    units: UnitOption[];
    tenants: TenantOption[];
}) {
    const form = useForm<QuoteFormValues>({
        invoice_number: generateQuoteNumber(),
        title: '',
        description: '',
        type: 'quote',
        currency: 'USD',
        amount: '0.00',
        paid_amount: '0.00',
        balance: '0.00',
        due_date: '',
        paid_date: '',
        status: 'draft',
        property_id: '',
        unit_id: '',
        tenant_id: '',
        recipient_name: '',
        recipient_email: '',
        notes: '',
        _line_items: JSON.stringify([
            { description: '', quantity: '1', unit_price: '0.00', amount: '0.00' },
        ]),
        _recipient_address: '',
        _company_name: 'SOMFIX Property Management',
        _company_address: '',
        _company_phone: '',
        _company_email: '',
        _valid_until: '',
        _terms_conditions: '',
    });

    const lineItems: LineItem[] = JSON.parse(form.data._line_items || '[]');

    const setLineItems = (items: LineItem[]) => {
        const total = computeAmount(items);
        form.setData('_line_items', JSON.stringify(items));
        form.setData('amount', total);
        form.setData('balance', total); // quotes start unpaid
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: '1', unit_price: '0.00', amount: '0.00' }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
        const updated = lineItems.map((item, i) => {
            if (i !== index) return item;
            const next = { ...item, [field]: value };
            if (field === 'quantity' || field === 'unit_price') {
                const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
                const price = parseFloat(field === 'unit_price' ? value : item.unit_price) || 0;
                next.amount = (qty * price).toFixed(2);
            }
            return next;
        });
        setLineItems(updated);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const itemsText = lineItems
            .filter((i) => i.description)
            .map((i) => `• ${i.description} (qty: ${i.quantity} × ${form.data.currency} ${i.unit_price})`)
            .join('\n');

        const data: Partial<QuoteFormValues> = {
            ...form.data,
            description: itemsText || form.data.title || 'Quotation',
            paid_amount: '0.00',
            balance: form.data.amount,
        };

        delete (data as any)._line_items;
        delete (data as any)._recipient_address;
        delete (data as any)._company_name;
        delete (data as any)._company_address;
        delete (data as any)._company_phone;
        delete (data as any)._company_email;
        delete (data as any)._valid_until;
        delete (data as any)._terms_conditions;

        if (!data.property_id) delete data.property_id;
        if (!data.unit_id) delete data.unit_id;
        if (!data.tenant_id) delete data.tenant_id;
        if (!data.recipient_name) delete data.recipient_name;
        if (!data.recipient_email) delete data.recipient_email;
        if (!data.due_date) delete data.due_date;
        if (!data.notes) delete data.notes;

        form.transform(() => data);
        form.post(store.url());
    };

    return (
        <>
            <Head title="Create Quotation — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <div className="mb-6 flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/finance/create">
                            <ArrowLeft className="size-4" />
                            Back
                        </Link>
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        Quotation
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Company & Recipient */}
                    <section className="overflow-hidden rounded-2xl border border-amber-200/70 bg-card shadow-sm dark:border-amber-800/50">
                        <div className="border-b border-amber-200/70 bg-amber-50/50 px-5 py-4 dark:bg-amber-900/10 dark:border-amber-800/50">
                            <h2 className="font-semibold">Document Header</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Company details and recipient information.
                            </p>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-2">
                            {/* Company */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Building2 className="size-3.5" />
                                    From (Your Company)
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        value={form.data._company_name}
                                        onChange={(e) => form.setData('_company_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="SOMFIX Property Management"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Address</Label>
                                    <Textarea
                                        value={form.data._company_address}
                                        onChange={(e) => form.setData('_company_address', e.target.value)}
                                        className="min-h-[72px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                        placeholder="123 Main Street, City, Country"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={form.data._company_phone}
                                            onChange={(e) => form.setData('_company_phone', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={form.data._company_email}
                                            onChange={(e) => form.setData('_company_email', e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Recipient */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <User className="size-3.5" />
                                    Prepared For
                                </div>
                                <div className="space-y-2">
                                    <Label>Tenant</Label>
                                    <Select
                                        value={form.data.tenant_id}
                                        onValueChange={(value) => {
                                            form.setData('tenant_id', value);
                                            const tenant = tenants.find((t) => String(t.id) === value);
                                            if (tenant) {
                                                form.setData('recipient_name', `${tenant.first_name} ${tenant.last_name}`);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className={`w-full ${inputClass}`}>
                                            <SelectValue placeholder="Select tenant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tenants.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.first_name} {t.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.tenant_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Recipient Name</Label>
                                    <Input
                                        value={form.data.recipient_name}
                                        onChange={(e) => form.setData('recipient_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="Full name"
                                    />
                                    <InputError message={form.errors.recipient_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Recipient Email</Label>
                                    <Input
                                        type="email"
                                        value={form.data.recipient_email}
                                        onChange={(e) => form.setData('recipient_email', e.target.value)}
                                        className={inputClass}
                                    />
                                    <InputError message={form.errors.recipient_email} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Recipient Address</Label>
                                    <Textarea
                                        value={form.data._recipient_address}
                                        onChange={(e) => form.setData('_recipient_address', e.target.value)}
                                        className="min-h-[72px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quotation Meta */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                            <h2 className="font-semibold">Quotation Details</h2>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Quotation Number</Label>
                                <Input
                                    value={form.data.invoice_number}
                                    onChange={(e) => form.setData('invoice_number', e.target.value)}
                                    className={inputClass}
                                />
                                <InputError message={form.errors.invoice_number} />
                            </div>
                            <div className="space-y-2">
                                <Label>Quotation Title</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Maintenance Services Quote"
                                />
                                <InputError message={form.errors.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select
                                    value={form.data.currency}
                                    onValueChange={(v) => form.setData('currency', v as any)}
                                >
                                    <SelectTrigger className={`w-full ${inputClass}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="SOS">SOS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Issue Date</Label>
                                <Input
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className={inputClass}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valid Until</Label>
                                <Input
                                    type="date"
                                    value={form.data._valid_until}
                                    onChange={(e) => form.setData('_valid_until', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(v) => form.setData('status', v as any)}
                                >
                                    <SelectTrigger className={`w-full ${inputClass}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['draft', 'sent', 'cancelled'].map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Property</Label>
                                <Select
                                    value={form.data.property_id}
                                    onValueChange={(v) => form.setData('property_id', v)}
                                >
                                    <SelectTrigger className={`w-full ${inputClass}`}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select
                                    value={form.data.unit_id}
                                    onValueChange={(v) => form.setData('unit_id', v)}
                                >
                                    <SelectTrigger className={`w-full ${inputClass}`}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.unit_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* Line Items */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">Services / Items</h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Add the services or items you are quoting.
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                <Plus className="size-4" />
                                Add Item
                            </Button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="hidden md:grid md:grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/50">
                                <span className="col-span-6">Description</span>
                                <span className="col-span-2 text-right">Qty</span>
                                <span className="col-span-2 text-right">Unit Price</span>
                                <span className="col-span-1 text-right">Amount</span>
                                <span className="col-span-1" />
                            </div>
                            {lineItems.map((item, i) => (
                                <div key={i} className="grid md:grid-cols-12 gap-3 items-center">
                                    <div className="md:col-span-6">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                                            className={inputClass}
                                            placeholder="Service description"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(i, 'quantity', e.target.value)}
                                            className={`${inputClass} text-right`}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => updateLineItem(i, 'unit_price', e.target.value)}
                                            className={`${inputClass} text-right`}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-end">
                                        <span className="text-sm font-semibold tabular-nums">
                                            {form.data.currency} {parseFloat(item.amount || '0').toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeLineItem(i)}
                                            disabled={lineItems.length === 1}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t border-border/50 pt-4 mt-4">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs">
                                        <div className="flex justify-between text-sm font-bold border-t border-border/50 pt-2">
                                            <span>Total Estimate</span>
                                            <span className="tabular-nums text-primary">
                                                {form.data.currency} {parseFloat(form.data.amount || '0').toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Terms & Notes */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                            <h2 className="font-semibold">Terms & Notes</h2>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    value={form.data._terms_conditions}
                                    onChange={(e) => form.setData('_terms_conditions', e.target.value)}
                                    className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                    placeholder="This quotation is valid for 30 days…"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                    placeholder="Additional notes…"
                                />
                                <InputError message={form.errors.notes} />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" type="button">
                            <Link href="/finance/create">
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Save className="size-4" />
                            Save Quotation
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateQuotePage.layout = {
    breadcrumbs: [
        { title: 'Finance', href: index() },
        { title: 'Create Quotation', href: '/finance/create/quote' },
    ],
};
