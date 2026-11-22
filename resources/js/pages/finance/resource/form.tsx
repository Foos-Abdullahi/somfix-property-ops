import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { PageHeader, Panel, Field, MoneyInput, SelectField, SubmitButton, useMoney } from '@/components/finance/kit';
import { RESOURCES, type Ctx, type FieldDef, type Values } from '@/components/finance/resources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

type Rec = (Record<string, unknown> & { id: number }) | null;

function initialValues(fields: FieldDef[], record: Rec, defaults: Record<string, unknown>): Values {
    const v: Values = {};
    for (const f of fields) {
        const raw = record?.[f.name] ?? defaults?.[f.name];
        v[f.name] = raw === null || raw === undefined ? '' : f.type === 'date' || f.type === 'month' ? String(raw).slice(0, 10) : String(raw);
    }
    return v;
}

export default function ResourceForm({ resource, record, defaults, options }: { resource: string; record: Rec; defaults: Record<string, unknown>; options: Record<string, unknown> }) {
    const cfg = RESOURCES[resource];
    const money = useMoney();
    const ctx: Ctx = { money, options };
    const editing = !!record;
    const form = useForm<Values>(() => {
        const base = initialValues(cfg.fields, record, defaults);
        return cfg.seed ? cfg.seed(base, ctx) : base;
    });
    const values = form.data;
    const errors = form.errors as Record<string, string>;

    const set = (name: string, value: string) => {
        const next = { ...form.data, [name]: value };
        form.setData({ ...next, ...(cfg.onChange?.(name, value, next, ctx) ?? {}) });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => (cfg.transform ? (cfg.transform(d, editing) as Values) : d));
        if (editing) form.put(`${cfg.base}/${record!.id}`);
        else form.post(cfg.base);
    };

    const renderField = (f: FieldDef) => {
        const common = { id: f.name, 'aria-invalid': !!errors[f.name] } as const;
        const value = values[f.name] ?? '';
        switch (f.type) {
            case 'select':
                return <SelectField value={value} onChange={(v) => set(f.name, v)} options={f.options?.(ctx, values) ?? []} allowEmpty={f.allowEmpty} invalid={!!errors[f.name]} disabled={editing && f.lockedOnEdit} />;
            case 'textarea':
                return <Textarea {...common} rows={3} value={value} onChange={(e) => set(f.name, e.target.value)} />;
            case 'money':
                return <MoneyInput {...common} value={value} onChange={(e) => set(f.name, e.target.value)} placeholder="0.00" />;
            case 'percent':
                return <Input {...common} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={value} onChange={(e) => set(f.name, e.target.value)} placeholder="0" />;
            case 'date':
                return <Input {...common} type="date" value={value} onChange={(e) => set(f.name, e.target.value)} />;
            case 'month':
                return <Input {...common} type="month" value={value.slice(0, 7)} onChange={(e) => set(f.name, e.target.value ? `${e.target.value}-01` : '')} />;
            default:
                return <Input {...common} value={value} onChange={(e) => set(f.name, e.target.value)} />;
        }
    };

    const preview = cfg.preview?.(values, ctx);
    const title = editing ? `Edit ${cfg.titleOf(record!)}` : `New ${cfg.singular.toLowerCase()}`;

    return (
        <>
            <Head title={`${title} — Finance`} />
            <form onSubmit={submit} className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <PageHeader title={title} description={cfg.description} icon={cfg.icon} back={{ href: editing ? `${cfg.base}/${record!.id}` : cfg.base, label: editing ? 'Back to details' : cfg.plural }} />
                <div className={preview ? 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]' : ''}>
                    <Panel title="Details">
                        <div className="grid items-start gap-4 sm:grid-cols-2">
                            {cfg.fields
                                .filter((f) => !f.showIf || f.showIf(values))
                                .map((f) => (
                                    <Field key={f.name} label={f.label} required={f.required} error={errors[f.name]} hint={f.hint} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                                        {renderField(f)}
                                    </Field>
                                ))}
                        </div>
                    </Panel>
                    {preview && <div className="lg:sticky lg:top-4 lg:h-fit">{preview}</div>}
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button asChild type="button" variant="outline">
                        <Link href={editing ? `${cfg.base}/${record!.id}` : cfg.base}>Cancel</Link>
                    </Button>
                    <SubmitButton processing={form.processing}>
                        <Save className="size-4" />
                        {editing ? 'Save changes' : `Record ${cfg.singular.toLowerCase()}`}
                    </SubmitButton>
                </div>
            </form>
        </>
    );
}

ResourceForm.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance-report' }] });
