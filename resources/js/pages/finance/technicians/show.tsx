import { Head, Link } from '@inertiajs/react';
import { Banknote, Coins, UserRound } from 'lucide-react';
import { Can } from '@/components/can';
import { formatDate, formatMonth, methodLabel } from '@/components/finance/format';
import { EmptyState, KpiGrid, PageHeader, Panel, StatusBadge, useMoney } from '@/components/finance/kit';
import { MarkPaidDialog } from '@/components/finance/mark-paid-dialog';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { PayProfileForm, type Member } from './index';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function TechnicianShow({ technician, effectivePercent, commissions, payroll, methods }: { technician: Any; effectivePercent: number; commissions: Any[]; payroll: Any[]; methods: Record<string, string> }) {
    const money = useMoney();
    const external = technician.staff_type === 'external';
    const live = commissions.filter((c) => c.status !== 'cancelled');
    const earned = live.reduce((s, c) => s + Number(c.amount), 0) + payroll.reduce((s, p) => s + Number(p.net_pay), 0);
    const owed = live.filter((c) => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0) + payroll.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.net_pay), 0);
    const member = { ...technician, effective_percent: effectivePercent } as Member;

    return (
        <>
            <Head title={`${technician.name} — Pay`} />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <PageHeader title={technician.name} description={<span className="flex flex-wrap items-center gap-2">{technician.specialization ?? 'Team member'} <StatusBadge status={technician.status} /> · {external ? `${effectivePercent}% commission` : 'Salaried'}</span>} icon={UserRound} back={{ href: '/finance/technicians', label: 'Technician pay' }}
                    actions={<Can permission="finance.manage">{external ? <Button asChild size="sm"><Link href={`/finance/commissions/create?service_team_id=${technician.id}`}><Coins className="size-4" />New commission</Link></Button> : <Button asChild size="sm"><Link href="/finance/payroll/create"><Banknote className="size-4" />New salary line</Link></Button>}</Can>} />
                <KpiGrid items={[
                    { title: 'Total earned', value: earned, icon: Coins, tone: 'primary' },
                    { title: 'Owed now', value: owed, icon: Banknote, tone: owed > 0 ? 'warning' : 'neutral' },
                    { title: 'Jobs paid on', value: new Set(live.filter((c) => c.job_id).map((c) => c.job_id)).size, format: 'number', icon: UserRound, tone: 'info' },
                ]} />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="grid min-w-0 gap-5">
                        {external ? (
                            <Panel title="Commission history" flush>
                                {commissions.length ? (
                                    <ul className="divide-y">
                                        {commissions.map((c) => (
                                            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                                                <Link href={`/finance/commissions/${c.id}`} className="min-w-0"><span className="block font-medium text-primary">{c.payout_number}{c.job ? ` · ${c.job.job_number}` : ''}</span><span className="block text-xs text-muted-foreground">{formatDate(c.earned_date)} · {Number(c.percent)}% of {money(c.base_amount)}{c.paid_at ? ` · paid ${formatDate(c.paid_at)} (${methodLabel(c.payment_method)})` : ''}</span></Link>
                                                <span className="flex items-center gap-2"><StatusBadge status={c.status} /><span className="w-20 text-right font-semibold tabular-nums">{money(c.amount)}</span>
                                                    <Can permission="finance.manage">{c.status === 'pending' && <MarkPaidDialog url={`/finance/commissions/${c.id}/pay`} title="Pay commission" description={`Confirm ${money(c.amount)} was paid to ${technician.name}.`} methods={methods} trigger={<Button size="sm" variant="outline">Pay</Button>} />}</Can></span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <EmptyState icon={Coins} title="No commissions yet" />}
                            </Panel>
                        ) : (
                            <Panel title="Salary history" flush>
                                {payroll.length ? (
                                    <ul className="divide-y">
                                        {payroll.map((p) => (
                                            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                                                <Link href={`/finance/payroll/${p.id}`} className="min-w-0"><span className="block font-medium text-primary">{formatMonth(p.pay_month)}</span><span className="block text-xs text-muted-foreground">Gross {money(p.gross_pay)} · deductions {money(p.total_deductions)}</span></Link>
                                                <span className="flex items-center gap-2"><StatusBadge status={p.status} /><span className="w-20 text-right font-semibold tabular-nums">{money(p.net_pay)}</span>
                                                    <Can permission="finance.manage">{p.status === 'pending' && <MarkPaidDialog url={`/finance/payroll/${p.id}/pay`} title="Pay salary" description={`Confirm ${money(p.net_pay)} was paid to ${technician.name}.`} methods={methods} trigger={<Button size="sm" variant="outline">Pay</Button>} />}</Can></span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <EmptyState icon={Banknote} title="No salary lines yet" description="Generate this month's payroll from the Payroll page." />}
                            </Panel>
                        )}
                    </div>
                    <Can permission="finance.manage" fallback={null}>
                        <Panel title="Pay profile" className="h-fit"><PayProfileForm key={technician.updated_at} member={member} defaultPercent={effectivePercent} /></Panel>
                    </Can>
                </div>
            </div>
        </>
    );
}
TechnicianShow.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Technician pay', href: '/finance/technicians' }] });
