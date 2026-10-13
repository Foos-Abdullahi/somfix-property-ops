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

type InvoiceFormValues = {
    invoice_number: string;
    title: string;
    description: string;
    type: 'invoice';
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
    // line items serialized as JSON for backend storage in description
    _line_items: string;
    _recipient_address: string;
    _company_name: string;
    _company_address: string;
    _company_phone: string;
    _company_email: string;
    _payment_terms: string;
    _bank_details: string;
};

const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

function generateInvoiceNumber() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `INV-${y}${m}-${rand}`;
}

function computeAmount(items: LineItem[]): string {
    const total = items.reduce((sum, item) => {
        return sum + parseFloat(item.amount || '0');
    }, 0);
    return total.toFixed(2);
}

export default function CreateInvoicePage({
    properties,
    units,
    tenants,
}: {
    properties: PropertyOption[];
    units: UnitOption[];
    tenants: TenantOption[];
}) {
    const form = useForm<InvoiceFormValues>({
        invoice_number: generateInvoiceNumber(),
        title: '',
        description: '',
        type: 'invoice',
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
        _payment_terms: 'Net 30',
        _bank_details: '',
    });

    const lineItems: LineItem[] = JSON.parse(form.data._line_items || '[]');

    const setLineItems = (items: LineItem[]) => {
        const total = computeAmount(items);
        form.setData('_line_items', JSON.stringify(items));
        form.setData('amount', total);
        form.setData('balance', (parseFloat(total) - parseFloat(form.data.paid_amount || '0')).toFixed(2));
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

    const grandTotal = parseFloat(form.data.amount || '0');
    const paidAmount = parseFloat(form.data.paid_amount || '0');
    const balance = (grandTotal - paidAmount).toFixed(2);

    useEffect(() => {
        form.setData('balance', balance);
    }, [form.data.amount, form.data.paid_amount]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Build description from line items + notes
        const itemsText = lineItems
            .filter((i) => i.description)
            .map((i) => `• ${i.description} (qty: ${i.quantity} × ${form.data.currency} ${i.unit_price})`)
            .join('\n');
        const descriptionText = form.data.title || 'Invoice';

        const data: Partial<InvoiceFormValues> = {
            ...form.data,
            description: itemsText || descriptionText,
            balance,
        };

        // Remove UI-only fields that the backend doesn't accept
        delete (data as any)._line_items;
        delete (data as any)._recipient_address;
        delete (data as any)._company_name;
        delete (data as any)._company_address;
        delete (data as any)._company_phone;
        delete (data as any)._company_email;
        delete (data as any)._payment_terms;
        delete (data as any)._bank_details;

        if (!data.property_id) delete data.property_id;
        if (!data.unit_id) delete data.unit_id;
        if (!data.tenant_id) delete data.tenant_id;
        if (!data.recipient_name) delete data.recipient_name;
        if (!data.recipient_email) delete data.recipient_email;
        if (!data.due_date) delete data.due_date;
        if (!data.paid_date) delete data.paid_date;
        if (!data.notes) delete data.notes;

        form.transform(() => data);
        form.post(store.url());
    };

    return (
        <>
            <Head title="Create Invoice — SOMFIX" />
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
                        Invoice
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Company & Recipient */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                            <h2 className="font-semibold">Document Header</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Company details and recipient information.
                            </p>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-2">
                            {/* Company side */}
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
                                            placeholder="+252 61 000 0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={form.data._company_email}
                                            onChange={(e) => form.setData('_company_email', e.target.value)}
                                            className={inputClass}
                                            placeholder="info@somfix.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Recipient side */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <User className="size-3.5" />
                                    Bill To (Recipient)
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
                                        placeholder="tenant@email.com"
                                    />
                                    <InputError message={form.errors.recipient_email} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Recipient Address</Label>
                                    <Textarea
                                        value={form.data._recipient_address}
                                        onChange={(e) => form.setData('_recipient_address', e.target.value)}
                                        className="min-h-[72px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                        placeholder="Unit address or mailing address"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Invoice Meta */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                            <h2 className="font-semibold">Invoice Details</h2>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Invoice Number</Label>
                                <Input
                                    value={form.data.invoice_number}
                                    onChange={(e) => form.setData('invoice_number', e.target.value)}
                                    className={inputClass}
                                />
                                <InputError message={form.errors.invoice_number} />
                            </div>
                            <div className="space-y-2">
                                <Label>Invoice Title</Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Monthly Rent — October 2026"
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
                                <InputError message={form.errors.currency} />
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
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={form.data.due_date}
                                    onChange={(e) => form.setData('due_date', e.target.value)}
                                    className={inputClass}
                                />
                                <InputError message={form.errors.due_date} />
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
                                        {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
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
                                <InputError message={form.errors.property_id} />
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
                                <InputError message={form.errors.unit_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Terms</Label>
                                <Input
                                    value={form.data._payment_terms}
                                    onChange={(e) => form.setData('_payment_terms', e.target.value)}
                                    className={inputClass}
                                    placeholder="Net 30"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Line Items */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">Line Items</h2>
                                <p className="mt-1 text-xs text-muted-foreground">Add services, rent charges, or fees.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                <Plus className="size-4" />
                                Add Item
                            </Button>
                        </div>
                        <div className="p-5 space-y-3">
                            {/* Header */}
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
                                            placeholder="Service or item description"
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
                                            placeholder="1"
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
                                            placeholder="0.00"
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

                            {/* Totals */}
                            <div className="border-t border-border/50 pt-4 mt-4">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium tabular-nums">
                                                {form.data.currency} {parseFloat(form.data.amount || '0').toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm gap-3">
                                            <span className="text-muted-foreground shrink-0">Amount Paid</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.data.paid_amount}
                                                onChange={(e) => form.setData('paid_amount', e.target.value)}
                                                className="h-8 rounded-lg text-right border-border/70 bg-background shadow-none focus-visible:ring-primary/20 w-32"
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-2">
                                            <span>Balance Due</span>
                                            <span className={`tabular-nums ${parseFloat(balance) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                                {form.data.currency} {parseFloat(balance).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment & Notes */}
                    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                        <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                            <h2 className="font-semibold">Additional Information</h2>
                        </div>
                        <div className="grid gap-5 p-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Bank / Payment Details</Label>
                                <Textarea
                                    value={form.data._bank_details}
                                    onChange={(e) => form.setData('_bank_details', e.target.value)}
                                    className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                    placeholder="Account name, number, or mobile money details"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                                    placeholder="Thank you for your business…"
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
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            Save Invoice
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateInvoicePage.layout = {
    breadcrumbs: [
        { title: 'Finance', href: index() },
        { title: 'Create Invoice', href: '/finance/create/invoice' },
    ],
};
