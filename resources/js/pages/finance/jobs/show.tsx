import { Head, Link } from '@inertiajs/react';
import { Briefcase, Coins, ExternalLink, HandCoins, Plus, Receipt, ShoppingBag, Wrench } from 'lucide-react';
import { Can } from '@/components/can';
import { formatDate, methodLabel } from '@/components/finance/format';
import { DefinitionList, EmptyState, KpiGrid, Meter, PageHeader, Panel, StatusBadge, useMoney } from '@/components/finance/kit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { JobSummary } from './index';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function JobFinanceShow({ job, summary, request }: { job: Any; summary: JobSummary; request: Any | null }) {
    const money = useMoney();
    const invoices = (job.finances as Any[]).filter((f) => f.type === 'invoice');
    const payments: Any[] = invoices.flatMap((i) => (i.payments as Any[]).map((p): Any => ({ ...p, invoice: i }))).sort((a, b) => String(b.paid_at).localeCompare(String(a.paid_at)));
    const technicians = Array.from(new Map([...(job.work_orders as Any[]).filter((w) => w.service_team).map((w) => [w.service_team.id, w.service_team]), ...(job.labors as Any[]).filter((l) => l.service_team).map((l) => [l.service_team.id, l.service_team])] as [number, Any][]).values());
    const steps = [
        { label: 'Invoiced', value: summary.billed, tone: 'text-foreground' },
        { label: '− Materials at cost', value: -summary.materials_cost, tone: 'text-muted-foreground' },
        { label: '= Service fee', value: summary.service_fee, tone: 'text-foreground font-semibold' },
        { label: '− Technician commission', value: -summary.commission, tone: 'text-violet-600 dark:text-violet-300' },
        { label: '− Job costs', value: -summary.direct_expenses, tone: 'text-amber-600 dark:text-amber-300' },
        { label: '= SOMFIX keeps', value: summary.net_margin, tone: summary.net_margin < 0 ? 'text-destructive font-semibold' : 'text-emerald-600 dark:text-emerald-300 font-semibold' },
    ];

    return (
        <>
            <Head title={`${job.job_number} finance`} />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    title={`${job.job_number} · ${job.title}`}
                    description={<span className="flex flex-wrap items-center gap-2">{job.customer?.name ?? 'No customer'} <StatusBadge status={job.status} />{request && <span>· from website request #{request.id}</span>}</span>}
                    icon={Briefcase}
                    back={{ href: '/finance/jobs', label: 'Job profitability' }}
                    actions={
                        <>
                            <Button asChild size="sm" variant="outline"><Link href={`/sales/jobs/${job.id}`}><ExternalLink className="size-4" />Open job</Link></Button>
                            <Can permission="finance.manage">
                                <Button asChild size="sm" variant="outline"><Link href={`/finance/quotations/create?job_id=${job.id}`}>Quote</Link></Button>
                                <Button asChild size="sm" variant="outline"><Link href={`/finance/expenses/create?job_id=${job.id}`}><Plus className="size-4" />Cost</Link></Button>
                                <Button asChild size="sm" variant="outline"><Link href={`/finance/commissions/create?job_id=${job.id}`}><Coins className="size-4" />Commission</Link></Button>
                                {summary.outstanding > 0 && invoices.find((i) => i.balance > 0) && (
                                    <Button asChild size="sm"><Link href={`/finance/payments/create?finance_id=${invoices.find((i) => Number(i.balance) > 0)?.id}`}><HandCoins className="size-4" />Record payment</Link></Button>
                                )}
                            </Can>
                        </>
                    }
                />

                <KpiGrid items={[
                    { title: 'Invoiced', value: summary.billed, icon: Receipt, tone: 'primary', hint: `${summary.invoice_count} invoice(s) · approved ${money(summary.approved_value, { compact: true })}` },
                    { title: 'Collected', value: summary.collected, icon: HandCoins, tone: 'success', hint: summary.outstanding > 0 ? `${money(summary.outstanding)} outstanding` : 'Fully collected' },
                    { title: 'Commission', value: summary.commission, icon: Coins, tone: 'violet', hint: `${money(summary.commission_due)} still owed` },
                    { title: 'SOMFIX net margin', value: summary.net_margin, icon: Briefcase, tone: summary.net_margin >= 0 ? 'success' : 'danger', hint: summary.margin_pct !== null ? `${summary.margin_pct}% of invoiced` : 'Not invoiced yet' },
                ]} />

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="grid min-w-0 gap-5">
                        <Panel title="Invoices & payments" description="Money coming in from the customer" action={<Can permission="finance.manage"><Button asChild size="sm" variant="outline"><Link href={`/finance/invoices/create?job_id=${job.id}`}><Plus className="size-4" />Invoice</Link></Button></Can>} flush>
                            {invoices.length ? (
                                <div className="divide-y">
                                    {invoices.map((i) => (
                                        <div key={i.id} className="px-4 py-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2"><Link href={`/finance/invoices/${i.id}`} className="font-semibold text-primary hover:underline">{i.invoice_number}</Link><StatusBadge status={i.status} /></div>
                                                <span className="text-sm tabular-nums">{money(i.paid_amount)} of {money(i.amount)}</span>
                                            </div>
                                            <div className="mt-2"><Meter value={Number(i.paid_amount)} max={Number(i.amount)} tone={Number(i.balance) > 0 ? 'warning' : 'success'} label="Invoice collected" /></div>
                                            {(i.payments as Any[]).length > 0 && (
                                                <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                                    {(i.payments as Any[]).map((p) => (<li key={p.id} className="flex justify-between"><Link href={`/finance/payments/${p.id}`} className="hover:text-primary">{p.payment_number} · {formatDate(p.paid_at)} · {methodLabel(p.method)}</Link><span className="tabular-nums">{money(p.amount)}</span></li>))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState icon={Receipt} title="Not invoiced yet" description="Create an invoice linked to this job to start tracking revenue." />}
                        </Panel>

                        <Panel title="Technician commission" description="What the technician(s) earn from this job" flush>
                            {job.technician_payouts.length ? (
                                <ul className="divide-y">
                                    {(job.technician_payouts as Any[]).map((t) => (
                                        <li key={t.id}><Link href={`/finance/commissions/${t.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50">
                                            <span><span className="block font-medium">{t.service_team?.name ?? 'Technician'}</span><span className="block text-xs text-muted-foreground">{t.payout_number} · {Number(t.percent)}% of {money(t.base_amount)}</span></span>
                                            <span className="flex items-center gap-3"><StatusBadge status={t.status} /><span className="font-semibold tabular-nums">{money(t.amount)}</span></span>
                                        </Link></li>
                                    ))}
                                </ul>
                            ) : <EmptyState icon={Coins} title="No commission recorded" description={technicians.length ? `Assigned: ${technicians.map((t) => t.name).join(', ')}.` : 'External technicians earn a share of the service fee.'} />}
                        </Panel>

                        <div className="grid gap-5 md:grid-cols-2">
                            <Panel title="Materials used (at cost)" flush>
                                {job.materials.length ? (
                                    <ul className="divide-y text-sm">
                                        {(job.materials as Any[]).map((m) => (<li key={m.id} className="flex justify-between gap-3 px-4 py-2.5"><span className="truncate">{m.inventory?.name ?? 'Item'} × {Number(m.quantity)}</span><span className="tabular-nums">{money(Number(m.quantity) * Number(m.unit_cost))}</span></li>))}
                                    </ul>
                                ) : <EmptyState icon={ShoppingBag} title="No materials" />}
                            </Panel>
                            <Panel title="Costs charged to this job" flush>
                                {job.expenses.length ? (
                                    <ul className="divide-y text-sm">
                                        {(job.expenses as Any[]).map((e) => (<li key={e.id}><Link href={`/finance/expenses/${e.id}`} className="flex justify-between gap-3 px-4 py-2.5 hover:bg-muted/50"><span className="truncate">{e.description}</span><span className="tabular-nums">{money(e.amount)}</span></Link></li>))}
                                    </ul>
                                ) : <EmptyState icon={Wrench} title="No job costs" description="Fuel, tools or other costs you link to this job appear here." />}
                            </Panel>
                        </div>
                    </div>

                    <div className="grid h-fit gap-5">
                        <Panel title="Where the money goes" description="Follow the invoice down to what SOMFIX keeps">
                            <ul className="grid gap-2 text-sm">
                                {steps.map((s) => (<li key={s.label} className={cn('flex justify-between gap-3', s.label.startsWith('=') && 'border-t pt-2')}><span className="text-muted-foreground">{s.label}</span><span className={cn('tabular-nums', s.tone)}>{money(s.value)}</span></li>))}
                            </ul>
                        </Panel>
                        <Panel title="Cash received">
                            {payments.length ? <ul className="grid gap-2 text-sm">{payments.slice(0, 6).map((p) => (<li key={p.id} className="flex justify-between"><span className="text-muted-foreground">{formatDate(p.paid_at)} · {methodLabel(p.method)}</span><span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-300">+{money(p.amount)}</span></li>))}</ul> : <p className="text-sm text-muted-foreground">No payments yet.</p>}
                        </Panel>
                        <Panel title="Job details">
                            <DefinitionList items={[
                                { label: 'Customer', value: job.customer ? <Link className="text-primary hover:underline" href={`/sales/customers/${job.customer.id}`}>{job.customer.name}</Link> : null },
                                { label: 'Property', value: job.property?.name },
                                { label: 'Scheduled', value: formatDate(job.scheduled_date) },
                                { label: 'Completed', value: formatDate(job.completed_date) },
                                { label: 'Technicians', value: technicians.map((t) => t.name).join(', ') },
                            ]} />
                        </Panel>
                    </div>
                </div>
            </div>
        </>
    );
}
JobFinanceShow.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Jobs', href: '/finance/jobs' }] });
