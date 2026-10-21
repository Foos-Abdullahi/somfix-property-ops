import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Save, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Option = { id: number; name?: string; unit_number?: string };
const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export default function LeadForm({
    lead,
    customers,
    properties,
    units,
}: {
    lead?: any;
    customers: Option[];
    properties: Option[];
    units: Option[];
}) {
    const editing = !!lead;
    const form = useForm({
        customer_id: String(lead?.customer_id ?? ''),
        property_id: String(lead?.property_id ?? ''),
        unit_id: String(lead?.unit_id ?? ''),
        source: lead?.source ?? 'walk_in',
        service_category: lead?.service_category ?? '',
        title: lead?.title ?? '',
        description: lead?.description ?? '',
        status: lead?.status ?? 'new',
        estimated_value: lead?.estimated_value ?? '',
        preferred_visit_date: lead?.preferred_visit_date ?? '',
        notes: lead?.notes ?? '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        editing
            ? form.put(`/sales/leads/${lead.id}`)
            : form.post('/sales/leads');
    };
    return (
        <>
            <Head title={`${editing ? 'Edit' : 'New'} Lead — SOMFIX`} />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Target className="size-4" />
                            </div>
                            <h1 className="page-title-enter text-lg font-semibold">
                                {editing ? 'Edit lead' : 'New service lead'}
                            </h1>
                        </div>
                        <p className="page-description-enter mt-1 text-xs text-muted-foreground">
                            Capture the customer request before inspection,
                            quotation, and job planning.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={
                                editing
                                    ? `/sales/leads/${lead.id}`
                                    : '/sales/leads'
                            }
                        >
                            <ArrowLeft />
                            Back
                        </Link>
                    </Button>
                </div>
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                        <h2 className="font-semibold">Request and customer</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Who needs the service and how did they contact
                            SOMFIX?
                        </p>
                    </div>
                    <div className="grid gap-5 p-5 md:grid-cols-2">
                        <AppSelect
                            label="Customer"
                            value={form.data.customer_id}
                            set={(v) => form.setData('customer_id', v)}
                            placeholder="Select customer"
                            items={customers.map((x) => [
                                String(x.id),
                                x.name!,
                            ])}
                            optional
                        />
                        <AppSelect
                            label="Lead source"
                            value={form.data.source}
                            set={(v) => form.setData('source', v)}
                            items={[
                                'website',
                                'phone',
                                'whatsapp',
                                'walk_in',
                                'referral',
                            ].map((x) => [x, x.replaceAll('_', ' ')])}
                        />
                        <Field
                            label="Service category"
                            value={form.data.service_category}
                            set={(v) => form.setData('service_category', v)}
                            required
                        />
                        <Field
                            label="Request title"
                            value={form.data.title}
                            set={(v) => form.setData('title', v)}
                            required
                        />
                        <div className="space-y-2 md:col-span-2">
                            <Label>Request description</Label>
                            <Textarea
                                className="min-h-28 rounded-xl border-border/70"
                                required
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                placeholder="Describe the problem, service needed, location details, and any urgency."
                            />
                        </div>
                    </div>
                </section>
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                        <h2 className="font-semibold">Visit and sales stage</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Set the expected value, property context, and
                            follow-up stage.
                        </p>
                    </div>
                    <div className="grid gap-5 p-5 md:grid-cols-2">
                        <AppSelect
                            label="Property"
                            value={form.data.property_id}
                            set={(v) => form.setData('property_id', v)}
                            placeholder="No managed property"
                            items={properties.map((x) => [
                                String(x.id),
                                x.name!,
                            ])}
                            optional
                        />
                        <AppSelect
                            label="Unit"
                            value={form.data.unit_id}
                            set={(v) => form.setData('unit_id', v)}
                            placeholder="No unit"
                            items={units.map((x) => [
                                String(x.id),
                                x.unit_number!,
                            ])}
                            optional
                        />
                        <Field
                            label="Estimated value (USD)"
                            type="number"
                            value={form.data.estimated_value}
                            set={(v) => form.setData('estimated_value', v)}
                        />
                        <div className="space-y-2">
                            <Label>Preferred visit date</Label>
                            <DatePicker
                                label="Select preferred visit date"
                                value={form.data.preferred_visit_date}
                                onChange={(value) =>
                                    form.setData('preferred_visit_date', value)
                                }
                                className={`${inputClass} w-full justify-start`}
                            />
                        </div>
                        <AppSelect
                            label="Lead stage"
                            value={form.data.status}
                            set={(v) => form.setData('status', v)}
                            items={[
                                'new',
                                'contacted',
                                'inspection_scheduled',
                                'quoted',
                                'converted',
                                'closed',
                            ].map((x) => [x, x.replaceAll('_', ' ')])}
                        />
                        <div className="space-y-2">
                            <Label>Internal notes</Label>
                            <Textarea
                                className="rounded-xl border-border/70"
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                placeholder="Next action, follow-up notes, or access details."
                            />
                        </div>
                    </div>
                </section>
                <div className="flex items-center justify-between">
                    <Button asChild variant="outline">
                        <Link href="/sales/leads">
                            <ArrowLeft />
                            Cancel
                        </Link>
                    </Button>
                    <Button disabled={form.processing}>
                        <Save />
                        {form.processing
                            ? 'Saving...'
                            : editing
                              ? 'Save changes'
                              : 'Create lead'}
                    </Button>
                </div>
            </form>
        </>
    );
}
function Field({
    label,
    value,
    set,
    type = 'text',
    required = false,
}: {
    label: string;
    value: string;
    set: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                required={required}
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                className={inputClass}
            />
        </div>
    );
}
function AppSelect({
    label,
    value,
    set,
    items,
    placeholder,
    optional = false,
}: {
    label: string;
    value: string;
    set: (value: string) => void;
    items: string[][];
    placeholder?: string;
    optional?: boolean;
}) {
    const none = '__none__';
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select
                value={value || none}
                onValueChange={(v) => set(v === none ? '' : v)}
            >
                <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {optional && (
                        <SelectItem value={none}>
                            {placeholder ?? 'Not selected'}
                        </SelectItem>
                    )}
                    {items.map(([itemValue, text]) => (
                        <SelectItem key={itemValue} value={itemValue}>
                            {text}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
LeadForm.layout = {
    breadcrumbs: [
        { title: 'Sales & Jobs', href: '/sales' },
        { title: 'Leads', href: '/sales/leads' },
        { title: 'Lead form', href: '/sales/leads/create' },
    ],
};
