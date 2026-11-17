import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, Download, Landmark, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDate, methodLabel } from '@/components/finance/format';
import { FilterSelect, KpiGrid, PageHeader, useMoney } from '@/components/finance/kit';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Entry = { key: string; date: string; direction: 'in' | 'out'; fund: 'company' | 'client'; kind: string; kind_label: string; title: string; party: string | null; amount: number; method: string | null; url: string; job_id: number | null; job_number: string | null; invoice_id: number | null; invoice_number: string | null; property: string | null; technician: string | null };

export default function Ledger({ entries, totals, kinds, period }: { entries: Entry[]; totals: Record<string, number>; kinds: Record<string, string>; period: { from: string; to: string } }) {
    const money = useMoney();
    const [range, setRange] = useState(period);
    const [kind, setKind] = useState('all');
    const [dir, setDir] = useState('all');
    const [fund, setFund] = useState('all');
    const data = useMemo(() => entries.filter((e) => (kind === 'all' || e.kind === kind) && (dir === 'all' || e.direction === dir) && (fund === 'all' || e.fund === fund)), [entries, kind, dir, fund]);
    const right = { thClassName: 'text-right', tdClassName: 'text-right' };
    const columns = useMemo<ColumnDef<Entry>[]>(() => [
        { id: 'date', header: 'Date', accessorFn: (e) => e.date, cell: ({ row }) => formatDate(row.original.date) },
        { id: 'entry', header: 'Entry', accessorFn: (e) => `${e.title} ${e.party ?? ''} ${e.property ?? ''} ${e.technician ?? ''}`, cell: ({ row: { original: e } }) => (<div className="flex items-center gap-2.5"><span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', e.direction === 'in' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>{e.direction === 'in' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}</span><div className="min-w-0"><Link href={e.url} className="block max-w-[320px] truncate font-medium text-primary hover:underline">{e.title}</Link><p className="truncate text-xs text-muted-foreground">{e.kind_label}{e.party ? ` · ${e.party}` : ''}</p></div></div>) },
        { id: 'job', header: 'Linked to', cell: ({ row: { original: e } }) => (<div className="text-xs">{e.job_number && <Link className="block text-primary hover:underline" href={`/finance/jobs/${e.job_id}`}>{e.job_number}</Link>}{e.invoice_number && <Link className="block text-primary hover:underline" href={`/finance/invoices/${e.invoice_id}`}>{e.invoice_number}</Link>}{e.property && <span className="block text-muted-foreground">{e.property}</span>}{e.technician && <span className="block text-muted-foreground">{e.technician}</span>}{!e.job_number && !e.invoice_number && !e.property && !e.technician && '—'}</div>) },
        { id: 'fund', header: 'Fund', accessorFn: (e) => e.fund, cell: ({ row }) => <span className={cn('rounded-md border px-1.5 py-0.5 text-[11px]', row.original.fund === 'client' ? 'border-sky-300 text-sky-700 dark:text-sky-300' : 'text-muted-foreground')}>{row.original.fund === 'client' ? 'Owner funds' : 'SOMFIX'}</span> },
        { id: 'method', header: 'Method', accessorFn: (e) => e.method, cell: ({ row }) => methodLabel(row.original.method) },
        { id: 'amount', header: 'Amount', accessorFn: (e) => (e.direction === 'in' ? e.amount : -e.amount), meta: right, cell: ({ row: { original: e } }) => <span className={cn('font-semibold tabular-nums', e.direction === 'in' ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300')}>{e.direction === 'in' ? '+' : '−'}{money(e.amount)}</span> },
    ], [money]);
    const apply = () => router.get('/finance/ledger', range, { preserveScroll: true });

    return (
        <>
            <Head title="Cash Ledger — Finance" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader title="Cash ledger" description="Every recorded money movement — customer payments, rent, expenses, commissions, salaries and owner payouts — each linked to its job, invoice, property or person."
                    icon={Scale} actions={<Button asChild size="sm" variant="outline"><a href={`/finance/ledger?from=${range.from}&to=${range.to}&export=csv`}><Download className="size-4" />Export CSV</a></Button>} />
                <div className="flex flex-wrap items-end gap-3">
                    <label className="grid gap-1 text-xs font-medium">From<Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="w-40" /></label>
                    <label className="grid gap-1 text-xs font-medium">To<Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="w-40" /></label>
                    <Button size="sm" onClick={apply}>Apply</Button>
                </div>
                <KpiGrid items={[
                    { title: 'SOMFIX cash in', value: totals.cashIn, icon: ArrowDownLeft, tone: 'success', compact: true },
                    { title: 'SOMFIX cash out', value: totals.cashOut, icon: ArrowUpRight, tone: 'danger', compact: true },
                    { title: 'Net company cash', value: totals.net, icon: Scale, tone: totals.net >= 0 ? 'primary' : 'danger', compact: true },
                    { title: 'Owner money held', value: totals.clientHeld, icon: Landmark, tone: 'info', compact: true, hint: `${money(totals.clientIn, { compact: true })} in · ${money(totals.clientOut, { compact: true })} out` },
                ]} />
                <DataTable columns={columns} data={data} title="Ledger" searchTitle="Search entry, person, property…"
                    filterControls={<div className="flex flex-wrap gap-2"><FilterSelect label="Type" value={kind} onChange={setKind} options={Object.entries(kinds).map(([value, label]) => ({ value, label }))} /><FilterSelect label="Direction" value={dir} onChange={setDir} options={[{ value: 'in', label: 'Money in' }, { value: 'out', label: 'Money out' }]} /><FilterSelect label="Fund" value={fund} onChange={setFund} options={[{ value: 'company', label: 'SOMFIX' }, { value: 'client', label: 'Owner funds' }]} /></div>} />
            </div>
        </>
    );
}
Ledger.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Cash ledger', href: '/finance/ledger' }] });
