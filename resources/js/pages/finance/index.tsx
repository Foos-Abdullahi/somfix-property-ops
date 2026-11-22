import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Banknote, Briefcase, CircleDollarSign, Coins, HandCoins, Landmark, Percent, PiggyBank, Plus, Receipt, Scale, TrendingUp, Wallet } from 'lucide-react';
import { Can } from '@/components/can';
import { AgingBar, DonutChart, TrendChart, type Slice } from '@/components/finance/charts';
import { formatDate } from '@/components/finance/format';
import { EmptyState, FilterSelect, KpiGrid, PageHeader, Panel, StatusBadge, useMoney } from '@/components/finance/kit';
import { Button } from '@/components/ui/button';
import { ReportTable, type Dataset } from '@/components/finance/report-table';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Kpis = Record<string, number>;
type Entry = { key: string; date: string; direction: 'in' | 'out'; fund: string; title: string; party: string | null; amount: number; kind_label: string; url: string; job_number: string | null };
type JobRow = { id: number; job_number: string; title: string; customer: string | null; billed: number; net_margin: number; margin_pct: number | null };

type CatalogItem = { key: string; title: string; group: string; description: string };

export default function FinanceReports({ catalog, activeReport, dataset, year, years, kpis, trend, aging, revenueMix, costMix, topJobs, lossJobs, recent, overdueInvoices }: {
    catalog: CatalogItem[]; activeReport: string | null; dataset: Dataset | null; year: number; years: number[]; kpis: Kpis; trend: { month: string; revenue: number; expenses: number; profit: number }[]; aging: { current: number; d1_30: number; d31_60: number; d60_plus: number };
    revenueMix: Slice[]; costMix: Slice[]; topJobs: JobRow[]; lossJobs: number; recent: Entry[];
    overdueInvoices: { id: number; invoice_number: string; title: string; recipient_name: string | null; balance: string; due_date: string }[];
}) {
    const money = useMoney();
    const go = (report: string | null, y: number | string = year) => router.get('/finance', { year: y, ...(report ? { report } : {}) }, { preserveScroll: true, preserveState: true });
    const attention = [
        kpis.overdueCount > 0 && { icon: AlertTriangle, text: `${kpis.overdueCount} overdue invoice(s) worth ${money(kpis.overdue)}`, href: '/finance/invoices', tone: 'text-red-600 dark:text-red-300' },
        kpis.commissionsDueCount > 0 && { icon: Coins, text: `${money(kpis.commissionsDue)} commission owed to ${kpis.commissionsDueCount} job(s)`, href: '/finance/commissions', tone: 'text-amber-600 dark:text-amber-300' },
        kpis.payrollDueCount > 0 && { icon: Banknote, text: `${kpis.payrollDueCount} salary line(s) unpaid — ${money(kpis.payrollDue)}`, href: '/finance/payroll', tone: 'text-amber-600 dark:text-amber-300' },
        kpis.owedToOwners > 0 && { icon: Landmark, text: `${money(kpis.owedToOwners)} held for property owners`, href: '/finance/owners', tone: 'text-sky-600 dark:text-sky-300' },
        lossJobs > 0 && { icon: Scale, text: `${lossJobs} job(s) are losing money`, href: '/finance/jobs', tone: 'text-red-600 dark:text-red-300' },
    ].filter(Boolean) as { icon: typeof Wallet; text: string; href: string; tone: string }[];

    return (
        <>
            <Head title="Finance Reports" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <div className={dataset ? "no-print" : undefined}>
                <PageHeader
                    title="Finance reports"
                    description="Every finance report in one place, with download to Excel or CSV and print. How SOMFIX earns: maintenance service fees and property management fees. Rent and materials are passed through at cost and are never counted as income."
                    icon={Wallet}
                    actions={
                        <>
                            <FilterSelect label="Year" value={String(year)} onChange={(v) => go(activeReport, v === 'all' ? year : v)} options={years.map((y) => ({ value: String(y), label: String(y) }))} />
                            <Can permission="finance.manage">
                                <Button asChild size="sm" variant="outline"><Link href="/finance/expenses/create"><Plus className="size-4" />Expense</Link></Button>
                                <Button asChild size="sm" variant="outline"><Link href="/finance/payments/create"><HandCoins className="size-4" />Payment</Link></Button>
                                <Button asChild size="sm"><Link href="/finance/invoices/create"><Receipt className="size-4" />New invoice</Link></Button>
                            </Can>
                        </>
                    }
                />
                </div>

                <div className="no-print flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-card p-1.5">
                    {[{ key: null as string | null, title: 'Overview' }, ...catalog].map((c) => (
                        <button key={c.key ?? 'overview'} type="button" onClick={() => go(c.key)} className={cn('rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors', activeReport === c.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>{c.title}</button>
                    ))}
                </div>

                {dataset && <ReportTable key={`${dataset.key}-${dataset.year}`} dataset={dataset} />}

                {!dataset && (<>
                <KpiGrid
                    items={[
                        { title: `Revenue ${year}`, value: kpis.revenue, icon: TrendingUp, tone: 'primary', hint: `${money(kpis.maintenanceFees, { compact: true })} maintenance · ${money(kpis.managementFees, { compact: true })} management`, compact: true },
                        { title: 'Net profit', value: kpis.netProfit, icon: PiggyBank, tone: kpis.netProfit >= 0 ? 'success' : 'danger', hint: `${kpis.netMargin}% net margin`, compact: true },
                        { title: 'Owed by customers', value: kpis.receivables, icon: Receipt, tone: kpis.overdue > 0 ? 'warning' : 'info', hint: kpis.overdue > 0 ? `${money(kpis.overdue)} overdue` : 'Nothing overdue', compact: true },
                        { title: 'Net cash this month', value: kpis.netCashThisMonth, icon: CircleDollarSign, tone: kpis.netCashThisMonth >= 0 ? 'success' : 'danger', hint: `${money(kpis.collectedThisMonth, { compact: true })} in · ${money(kpis.spentThisMonth, { compact: true })} out` },
                    ]}
                />
                <KpiGrid
                    items={[
                        { title: 'Gross profit', value: kpis.grossProfit, icon: Percent, tone: 'primary', hint: 'Revenue − technician commissions', compact: true },
                        { title: 'Operating costs', value: kpis.operatingExpenses, icon: Wallet, tone: 'warning', hint: 'Salaries + expenses', compact: true },
                        { title: 'Technician commissions', value: kpis.commissions, icon: Coins, tone: 'violet', hint: `${money(kpis.commissionsDue)} still owed`, compact: true },
                        { title: 'Held for owners', value: kpis.owedToOwners, icon: Landmark, tone: 'info', hint: 'Client money — not ours', compact: true },
                    ]}
                />

                {attention.length > 0 && (
                    <Panel title="Needs attention" className="border-amber-300/50">
                        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {attention.map((a) => (
                                <li key={a.text}>
                                    <Link href={a.href} className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
                                        <a.icon className={cn('size-4 shrink-0', a.tone)} />
                                        <span>{a.text}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                )}

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <Panel title="Revenue, costs and profit" description="Last six months of the selected year">
                        <TrendChart data={trend} />
                    </Panel>
                    <Panel title="Receivables aging" description="What customers still owe, by how late it is">
                        <AgingBar aging={aging} />
                        {overdueInvoices.length > 0 && (
                            <ul className="mt-4 grid gap-1.5 border-t pt-3 text-sm">
                                {overdueInvoices.map((i) => (
                                    <li key={i.id}>
                                        <Link href={`/finance/invoices/${i.id}`} className="flex justify-between gap-3 hover:text-primary">
                                            <span className="truncate">{i.invoice_number} · {i.recipient_name ?? i.title}</span>
                                            <span className="shrink-0 font-medium tabular-nums text-destructive">{money(i.balance)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    <Panel title="Where revenue comes from"><DonutChart data={revenueMix} centerLabel="Revenue" /></Panel>
                    <Panel title="Where the money goes"><DonutChart data={costMix} centerLabel="Costs" /></Panel>
                    <Panel title="Most profitable jobs" action={<Link href="/finance/jobs" className="text-xs text-primary hover:underline">All jobs</Link>} flush>
                        {topJobs.length ? (
                            <ul className="divide-y">
                                {topJobs.map((j) => (
                                    <li key={j.id}>
                                        <Link href={`/finance/jobs/${j.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
                                            <span className="min-w-0"><span className="block truncate font-medium">{j.job_number}</span><span className="block truncate text-xs text-muted-foreground">{j.customer ?? j.title}</span></span>
                                            <span className="shrink-0 text-right"><span className={cn('block font-semibold tabular-nums', j.net_margin < 0 && 'text-destructive')}>{money(j.net_margin)}</span><span className="block text-xs text-muted-foreground">{j.margin_pct ?? 0}% margin</span></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : <EmptyState icon={Briefcase} title="No billed jobs yet" description="Invoice a job and its margin appears here." />}
                    </Panel>
                </div>

                <Panel title="Recent money movement" description="Last 45 days · every entry is linked to its job, property or invoice" action={<Link href="/finance/ledger" className="text-xs text-primary hover:underline">Open cash ledger</Link>} flush>
                    {recent.length ? (
                        <ul className="divide-y">
                            {recent.map((e) => (
                                <li key={e.key}>
                                    <Link href={e.url} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
                                        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', e.direction === 'in' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
                                            {e.direction === 'in' ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-medium">{e.title}</span>
                                            <span className="block truncate text-xs text-muted-foreground">{e.kind_label}{e.party ? ` · ${e.party}` : ''}{e.job_number ? ` · ${e.job_number}` : ''}</span>
                                        </span>
                                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{formatDate(e.date)}</span>
                                        {e.fund === "client" && <span className="hidden rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">Owner funds</span>}
                                        <span className={cn('w-24 shrink-0 text-right font-semibold tabular-nums', e.direction === 'in' ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300')}>{e.direction === 'in' ? '+' : '−'}{money(e.amount)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : <EmptyState icon={Wallet} title="No money movement yet" description="Record a payment, rent collection or expense to start the ledger." />}
                </Panel>
                </>)}
            </div>
        </>
    );
}

FinanceReports.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Reports', href: '/finance' }] });
