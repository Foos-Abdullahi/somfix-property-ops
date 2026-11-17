import { Head, Link, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Building2, Eye, Landmark, Pencil, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Can } from '@/components/can';
import { Field, KpiGrid, MoneyInput, PageHeader, SelectField, SubmitButton, useMoney } from '@/components/finance/kit';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

export type Owner = { id: number; name: string; owner_name: string | null; owner_phone: string | null; status: string; units: number; fee_type: 'percent' | 'fixed_per_unit'; fee_percent: string | null; fee_fixed: string | null; collected: number; fees: number; costs: number; net_due: number; paid: number; balance: number; arrears: number };

export function FeeTermsForm({ owner, defaults, onDone }: { owner: Owner; defaults: { percent: number; fixed: number }; onDone?: () => void }) {
    const form = useForm({ owner_phone: owner.owner_phone ?? '', management_fee_type: owner.fee_type, management_fee_percent: owner.fee_percent ?? '', management_fee_fixed: owner.fee_fixed ?? '' });
    return (
        <form onSubmit={(e) => { e.preventDefault(); form.put(`/finance/owners/${owner.id}`, { preserveScroll: true, onSuccess: onDone }); }} className="grid gap-4">
            <Field label="How does SOMFIX earn on this property?" error={form.errors.management_fee_type}>
                <SelectField value={form.data.management_fee_type} onChange={(v) => form.setData('management_fee_type', v as Owner['fee_type'])} options={[{ value: 'percent', label: '% of rent collected' }, { value: 'fixed_per_unit', label: 'Fixed fee per unit / month' }]} />
            </Field>
            {form.data.management_fee_type === 'percent' ? (
                <Field label="Fee (% of rent)" error={form.errors.management_fee_percent} hint={`Blank = company default (${defaults.percent}%).`}><MoneyInput max="100" value={form.data.management_fee_percent} onChange={(e) => form.setData('management_fee_percent', e.target.value)} /></Field>
            ) : (
                <Field label="Fixed fee per unit / month" error={form.errors.management_fee_fixed} hint={`Blank = company default (${defaults.fixed}).`}><MoneyInput value={form.data.management_fee_fixed} onChange={(e) => form.setData('management_fee_fixed', e.target.value)} /></Field>
            )}
            <Field label="Owner phone" error={form.errors.owner_phone}><Input value={form.data.owner_phone} onChange={(e) => form.setData('owner_phone', e.target.value)} /></Field>
            <div className="flex justify-end"><SubmitButton processing={form.processing}>Save terms</SubmitButton></div>
        </form>
    );
}

export default function OwnersIndex({ owners, stats, defaults }: { owners: Owner[]; stats: Record<string, number>; defaults: { percent: number; fixed: number } }) {
    const money = useMoney();
    const [editing, setEditing] = useState<Owner | null>(null);
    const right = { thClassName: 'text-right', tdClassName: 'text-right' };
    const columns = useMemo<ColumnDef<Owner>[]>(() => [
        { id: 'property', header: 'Property / owner', accessorFn: (o) => `${o.name} ${o.owner_name ?? ''}`, cell: ({ row: { original: o } }) => (<div><Link href={`/finance/owners/${o.id}`} className="font-semibold text-primary hover:underline">{o.name}</Link><p className="text-xs text-muted-foreground">{o.owner_name ?? 'No owner recorded'}</p></div>) },
        { id: 'terms', header: 'SOMFIX fee', cell: ({ row: { original: o } }) => (o.fee_type === 'fixed_per_unit' ? `${money(o.fee_fixed ?? defaults.fixed)} / unit` : `${o.fee_percent ?? defaults.percent}% of rent`) },
        { id: 'collected', header: 'Rent collected', accessorFn: (o) => o.collected, meta: right, cell: ({ row }) => <span className="tabular-nums">{money(row.original.collected)}</span> },
        { id: 'fees', header: 'Our fees', accessorFn: (o) => o.fees, meta: right, cell: ({ row }) => <span className="tabular-nums text-emerald-600 dark:text-emerald-300">{money(row.original.fees)}</span> },
        { id: 'costs', header: 'Costs at cost', accessorFn: (o) => o.costs, meta: right, cell: ({ row }) => <span className="tabular-nums">{money(row.original.costs)}</span> },
        { id: 'paid', header: 'Paid out', accessorFn: (o) => o.paid, meta: right, cell: ({ row }) => <span className="tabular-nums">{money(row.original.paid)}</span> },
        { id: 'balance', header: 'Owed to owner', accessorFn: (o) => o.balance, meta: right, cell: ({ row }) => <span className={`font-semibold tabular-nums ${row.original.balance > 0 ? 'text-amber-600' : ''}`}>{money(row.original.balance)}</span> },
        { id: 'actions', header: '', cell: ({ row: { original: o } }) => (<div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}><Button asChild size="icon" variant="ghost" className="size-8" title="Statement"><Link href={`/finance/owners/${o.id}`}><Eye className="size-4 text-muted-foreground" /></Link></Button><Can permission="finance.manage"><Button size="icon" variant="ghost" className="size-8" title="Fee terms" onClick={() => setEditing(o)}><Pencil className="size-4 text-primary" /></Button></Can></div>) },
    ], [money, defaults]);

    return (
        <>
            <Head title="Property Owners — Finance" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader title="Property owners" description="Rent belongs to the owner. This shows, per property, what was collected, what SOMFIX kept as its fee, costs paid at cost, and what is still owed." icon={Landmark}
                    actions={<Can permission="finance.manage"><Button asChild size="sm" variant="outline"><Link href="/finance/rent/create">Record rent</Link></Button><Button asChild size="sm"><Link href="/finance/owner-payouts/create">Pay an owner</Link></Button></Can>} />
                <KpiGrid items={[
                    { title: 'Rent collected', value: stats.collected, icon: Building2, tone: 'primary', compact: true },
                    { title: 'SOMFIX fees', value: stats.fees, icon: TrendingUp, tone: 'success', compact: true, hint: 'Our only income from rent' },
                    { title: 'Paid to owners', value: stats.paid, icon: Landmark, tone: 'info', compact: true },
                    { title: 'Owed to owners', value: stats.owed, icon: AlertTriangle, tone: stats.owed > 0 ? 'warning' : 'neutral', compact: true, hint: `${stats.owedCount} owner(s) waiting` },
                ]} />
                <DataTable columns={columns} data={owners} title="Properties" searchTitle="Search property or owner…" rowHref={(r) => `/finance/owners/${r.original.id}`} />
            </div>
            <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Management fee — {editing?.name}</DialogTitle><DialogDescription>Applied to every future rent collection for this property.</DialogDescription></DialogHeader>
                    {editing && <FeeTermsForm key={editing.id} owner={editing} defaults={defaults} onDone={() => setEditing(null)} />}</DialogContent>
            </Dialog>
        </>
    );
}
OwnersIndex.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Owners', href: '/finance/owners' }] });
