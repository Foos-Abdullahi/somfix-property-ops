import { Head, Link, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Banknote, Coins, Eye, Pencil, Users, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Can } from '@/components/can';
import { Field, KpiGrid, PageHeader, SelectField, StatusBadge, SubmitButton, MoneyInput, useMoney } from '@/components/finance/kit';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

export type Member = { id: number; name: string; specialization: string | null; phone: string | null; status: string; staff_type: 'in_house' | 'external'; commission_percent: string | null; monthly_salary: string | null; monthly_allowances: string | null; effective_percent: number; jobs: number; earned: number; commission_pending: number; salary_pending: number; paid: number };

export function PayProfileForm({ member, defaultPercent, onDone }: { member: Member; defaultPercent: number; onDone?: () => void }) {
    const form = useForm({ staff_type: member.staff_type, commission_percent: member.commission_percent ?? '', monthly_salary: member.monthly_salary ?? '', monthly_allowances: member.monthly_allowances ?? '' });
    return (
        <form onSubmit={(e) => { e.preventDefault(); form.put(`/finance/technicians/${member.id}`, { preserveScroll: true, onSuccess: onDone }); }} className="grid gap-4">
            <Field label="How is this person paid?" error={form.errors.staff_type}>
                <SelectField value={form.data.staff_type} onChange={(v) => form.setData('staff_type', v as Member['staff_type'])} options={[{ value: 'external', label: 'External technician — commission per job' }, { value: 'in_house', label: 'In-house employee — monthly salary' }]} />
            </Field>
            {form.data.staff_type === 'external' ? (
                <Field label="Commission (% of job service fee)" error={form.errors.commission_percent} hint={`Leave blank to use the company default (${defaultPercent}%).`}>
                    <MoneyInput max="100" value={form.data.commission_percent} onChange={(e) => form.setData('commission_percent', e.target.value)} />
                </Field>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Monthly basic salary" error={form.errors.monthly_salary}><MoneyInput value={form.data.monthly_salary} onChange={(e) => form.setData('monthly_salary', e.target.value)} /></Field>
                    <Field label="Monthly allowances" error={form.errors.monthly_allowances}><MoneyInput value={form.data.monthly_allowances} onChange={(e) => form.setData('monthly_allowances', e.target.value)} /></Field>
                </div>
            )}
            <div className="flex justify-end"><SubmitButton processing={form.processing}>Save pay profile</SubmitButton></div>
        </form>
    );
}

export default function TechniciansFinance({ team, stats, defaults }: { team: Member[]; stats: Record<string, number>; defaults: { percent: number } }) {
    const money = useMoney();
    const [editing, setEditing] = useState<Member | null>(null);
    const right = { thClassName: 'text-right', tdClassName: 'text-right' };
    const columns = useMemo<ColumnDef<Member>[]>(() => [
        { id: 'name', header: 'Technician / staff', accessorFn: (m) => `${m.name} ${m.specialization ?? ''}`, cell: ({ row: { original: m } }) => (<div><Link href={`/finance/technicians/${m.id}`} className="font-semibold text-primary hover:underline">{m.name}</Link><p className="text-xs text-muted-foreground">{m.specialization ?? '—'}</p></div>) },
        { id: 'type', header: 'Paid by', accessorFn: (m) => m.staff_type, cell: ({ row: { original: m } }) => (<Badge variant="outline" className={m.staff_type === 'external' ? 'border-violet-300 text-violet-700 dark:text-violet-300' : 'border-sky-300 text-sky-700 dark:text-sky-300'}>{m.staff_type === 'external' ? 'Commission' : 'Salary'}</Badge>) },
        { id: 'terms', header: 'Terms', cell: ({ row: { original: m } }) => (m.staff_type === 'external' ? `${m.effective_percent}% of service fee${m.commission_percent === null ? ' (default)' : ''}` : `${money(Number(m.monthly_salary ?? 0) + Number(m.monthly_allowances ?? 0))} / month`) },
        { id: 'jobs', header: 'Jobs', accessorFn: (m) => m.jobs, meta: right },
        { id: 'earned', header: 'Total earned', accessorFn: (m) => m.earned, meta: right, cell: ({ row }) => <span className="font-semibold tabular-nums">{money(row.original.earned)}</span> },
        { id: 'owed', header: 'Owed now', accessorFn: (m) => m.commission_pending + m.salary_pending, meta: right, cell: ({ row: { original: m } }) => { const o = m.commission_pending + m.salary_pending; return <span className={o > 0 ? 'font-medium tabular-nums text-amber-600' : 'text-muted-foreground'}>{o > 0 ? money(o) : '—'}</span>; } },
        { id: 'status', header: 'Status', accessorFn: (m) => m.status, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
        { id: 'actions', header: '', cell: ({ row: { original: m } }) => (<div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}><Button asChild size="icon" variant="ghost" className="size-8" title="Statement"><Link href={`/finance/technicians/${m.id}`}><Eye className="size-4 text-muted-foreground" /></Link></Button><Can permission="finance.manage"><Button size="icon" variant="ghost" className="size-8" title="Edit pay profile" onClick={() => setEditing(m)}><Pencil className="size-4 text-primary" /></Button></Can></div>) },
    ], [money]);

    return (
        <>
            <Head title="Technician Pay — Finance" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader title="Technician pay" description="External technicians earn commission on jobs; in-house staff are paid a monthly salary. Set each person's pay profile here." icon={Users}
                    actions={<Can permission="finance.manage"><Button asChild size="sm" variant="outline"><Link href="/finance/commissions"><Coins className="size-4" />Commissions</Link></Button><Button asChild size="sm" variant="outline"><Link href="/finance/payroll"><Banknote className="size-4" />Payroll</Link></Button></Can>} />
                <KpiGrid items={[
                    { title: 'Commission-based', value: stats.external, format: 'number', icon: Coins, tone: 'violet' },
                    { title: 'Salaried staff', value: stats.inHouse, format: 'number', icon: Users, tone: 'info' },
                    { title: 'Owed to team', value: stats.pending, icon: Wallet, tone: stats.pending > 0 ? 'warning' : 'neutral', compact: true },
                    { title: 'Paid so far', value: stats.paid, icon: Banknote, tone: 'success', compact: true },
                ]} />
                <DataTable columns={columns} data={team} title="Team" searchTitle="Search name or skill…" rowHref={(r) => `/finance/technicians/${r.original.id}`} />
            </div>
            <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Pay profile — {editing?.name}</DialogTitle><DialogDescription>Controls whether this person earns commission per job or a monthly salary.</DialogDescription></DialogHeader>
                    {editing && <PayProfileForm key={editing.id} member={editing} defaultPercent={defaults.percent} onDone={() => setEditing(null)} />}
                    <DialogFooter className="sm:hidden" />
                </DialogContent>
            </Dialog>
        </>
    );
}
TechniciansFinance.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Technician pay', href: '/finance/technicians' }] });
