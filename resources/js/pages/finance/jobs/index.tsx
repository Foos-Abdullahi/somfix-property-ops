import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Briefcase, Coins, Eye, HandCoins, PiggyBank, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDate } from '@/components/finance/format';
import { FilterSelect, KpiGrid, Meter, PageHeader, StatusBadge, useMoney } from '@/components/finance/kit';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

export type JobSummary = { id: number; job_number: string; title: string; status: string; customer: string | null; date: string | null; billed: number; collected: number; outstanding: number; materials_cost: number; service_fee: number; commission: number; commission_paid: number; commission_due: number; direct_expenses: number; net_margin: number; margin_pct: number | null; invoice_count: number; approved_value: number };

export default function JobsFinance({ jobs, stats }: { jobs: JobSummary[]; stats: Record<string, number> }) {
    const money = useMoney();
    const [view, setView] = useState('all');
    const data = useMemo(() => jobs.filter((j) => view === 'all' || (view === 'unpaid' && j.outstanding > 0) || (view === 'loss' && j.billed > 0 && j.net_margin < 0) || (view === 'unbilled' && j.billed === 0 && j.status !== 'cancelled') || (view === 'commission' && j.commission_due > 0)), [jobs, view]);
    const right = { thClassName: 'text-right', tdClassName: 'text-right' };
    const columns = useMemo<ColumnDef<JobSummary>[]>(() => [
        { id: 'job', header: 'Job', accessorFn: (j) => `${j.job_number} ${j.title} ${j.customer ?? ''}`, cell: ({ row: { original: j } }) => (<div><Link href={`/finance/jobs/${j.id}`} className="font-semibold text-primary hover:underline">{j.job_number}</Link><p className="max-w-[220px] truncate text-xs text-muted-foreground">{j.customer ?? '—'} · {j.title}</p></div>) },
        { id: 'status', header: 'Status', accessorFn: (j) => j.status, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
        { id: 'date', header: 'Date', accessorFn: (j) => j.date, cell: ({ row }) => formatDate(row.original.date) },
        { id: 'billed', header: 'Invoiced', accessorFn: (j) => j.billed, meta: right, cell: ({ row }) => <span className="tabular-nums">{money(row.original.billed)}</span> },
        { id: 'collected', header: 'Collected', accessorFn: (j) => j.collected, meta: right, cell: ({ row: { original: j } }) => (<div className="ml-auto w-24"><span className="block text-right tabular-nums">{money(j.collected)}</span><Meter value={j.collected} max={j.billed} tone={j.outstanding > 0 ? 'warning' : 'success'} label="Collected share" /></div>) },
        { id: 'materials', header: 'Materials (cost)', accessorFn: (j) => j.materials_cost, meta: right, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{money(row.original.materials_cost)}</span> },
        { id: 'commission', header: 'Commission', accessorFn: (j) => j.commission, meta: right, cell: ({ row: { original: j } }) => <span className="tabular-nums">{money(j.commission)}{j.commission_due > 0 && <span className="block text-[11px] text-amber-600">{money(j.commission_due)} owed</span>}</span> },
        { id: 'margin', header: 'Net margin', accessorFn: (j) => j.net_margin, meta: right, cell: ({ row: { original: j } }) => (<span className={cn('font-semibold tabular-nums', j.net_margin < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-300')}>{money(j.net_margin)}{j.margin_pct !== null && <span className="block text-[11px] font-normal text-muted-foreground">{j.margin_pct}%</span>}</span>) },
        { id: 'actions', header: '', cell: ({ row }) => (<Button asChild size="icon" variant="ghost" className="size-8" title="View job finance"><Link href={`/finance/jobs/${row.original.id}`}><Eye className="size-4 text-muted-foreground" /></Link></Button>) },
    ], [money]);

    return (
        <>
            <Head title="Job Profitability — Finance" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader title="Job profitability" description="Each job's money in one place: what was invoiced and collected, materials at cost, technician commission, job costs — and what SOMFIX keeps." icon={Briefcase} />
                <KpiGrid items={[
                    { title: 'Invoiced', value: stats.billed, icon: Receipt, tone: 'primary', compact: true, hint: `${money(stats.collected, { compact: true })} collected` },
                    { title: 'Still to collect', value: stats.outstanding, icon: AlertTriangle, tone: stats.outstanding > 0 ? 'warning' : 'neutral', compact: true },
                    { title: 'Technician commission', value: stats.commission, icon: Coins, tone: 'violet', compact: true },
                    { title: 'Net job margin', value: stats.netMargin, icon: PiggyBank, tone: stats.netMargin >= 0 ? 'success' : 'danger', compact: true, hint: `${stats.marginPct}% of invoiced` },
                ]} />
                <DataTable columns={columns} data={data} title="Jobs" searchTitle="Search job, customer…" rowHref={(r) => `/finance/jobs/${r.original.id}`}
                    filterControls={<FilterSelect label="Show" value={view} onChange={setView} options={[{ value: 'unpaid', label: `Unpaid balance` }, { value: 'unbilled', label: `Not invoiced (${stats.unbilled})` }, { value: 'commission', label: 'Commission owed' }, { value: 'loss', label: `Losing money (${stats.loss})` }]} />} />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><HandCoins className="size-3.5" />Service fee = invoiced − materials at cost. Net margin = service fee − technician commission − costs charged to the job.</p>
            </div>
        </>
    );
}
JobsFinance.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Jobs', href: '/finance/jobs' }] });
