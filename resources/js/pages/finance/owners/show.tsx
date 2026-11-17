import { Head, Link, router } from '@inertiajs/react';
import { Building2, Landmark, Printer } from 'lucide-react';
import { useState } from 'react';
import { Can } from '@/components/can';
import { formatDate, formatMonth, methodLabel } from '@/components/finance/format';
import { EmptyState, KpiGrid, PageHeader, Panel, useMoney } from '@/components/finance/kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import { FeeTermsForm, type Owner } from './index';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function OwnerShow({ property, position, period, collections, expenses, payouts, totals, defaults }: { property: Any; position: Owner; period: { from: string; to: string }; collections: Any[]; expenses: Any[]; payouts: Any[]; totals: Record<string, number>; defaults: { percent: number; fixed: number } }) {
    const money = useMoney();
    const [range, setRange] = useState(period);
    const apply = () => router.get(`/finance/owners/${property.id}`, range, { preserveScroll: true });
    const Row = ({ href, a, b, amount, tone }: { href: string; a: string; b: string; amount: string; tone?: string }) => (<li><Link href={href} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50"><span className="min-w-0"><span className="block truncate font-medium">{a}</span><span className="block truncate text-xs text-muted-foreground">{b}</span></span><span className={`shrink-0 font-semibold tabular-nums ${tone ?? ''}`}>{amount}</span></Link></li>);
    return (
        <>
            <Head title={`${property.name} — Owner statement`} />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <PageHeader title={property.name} description={`Owner: ${property.owner_name ?? 'not recorded'}${property.owner_phone ? ` · ${property.owner_phone}` : ''}`} icon={Building2} back={{ href: '/finance/owners', label: 'Property owners' }}
                    actions={<><Button asChild size="sm" variant="outline"><a href={`/finance/owners/${property.id}/print?from=${range.from}&to=${range.to}`} target="_blank" rel="noreferrer"><Printer className="size-4" />Print statement</a></Button>
                        <Can permission="finance.manage"><Button asChild size="sm" variant="outline"><Link href={`/finance/rent/create?property_id=${property.id}`}>Record rent</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/finance/property-expenses/create?property_id=${property.id}`}>Add cost</Link></Button><Button asChild size="sm"><Link href={`/finance/owner-payouts/create?property_id=${property.id}`}><Landmark className="size-4" />Pay owner</Link></Button></Can></>} />
                <Panel>
                    <div className="flex flex-wrap items-end gap-3">
                        <label className="grid gap-1 text-xs font-medium">From<Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="w-40" /></label>
                        <label className="grid gap-1 text-xs font-medium">To<Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="w-40" /></label>
                        <Button size="sm" onClick={apply}>Apply period</Button>
                        <p className="ml-auto text-sm text-muted-foreground">All-time balance owed: <strong className="text-foreground">{money(position.balance)}</strong></p>
                    </div>
                </Panel>
                <KpiGrid items={[
                    { title: 'Rent collected', value: totals.collected, icon: Building2, tone: 'primary', compact: true },
                    { title: 'SOMFIX fee', value: totals.fees, icon: Landmark, tone: 'success', compact: true },
                    { title: 'Costs at cost', value: totals.costs, icon: Building2, tone: 'warning', compact: true },
                    { title: 'Paid to owner', value: totals.paid, icon: Landmark, tone: 'info', compact: true, hint: `Period balance ${money(totals.periodBalance)}` },
                ]} />
                <div className="grid gap-5 lg:grid-cols-3">
                    <Panel title="Rent received" flush>{collections.length ? <ul className="divide-y">{collections.map((c) => <Row key={c.id} href={`/finance/rent/${c.id}`} a={`${c.tenant_name || 'Rent'}${c.unit ? ` · ${c.unit.unit_number}` : ''}`} b={`${formatMonth(c.rent_month)} · fee ${money(c.fee_amount)}`} amount={money(c.amount_collected)} />)}</ul> : <EmptyState icon={Building2} title="No rent in this period" />}</Panel>
                    <Panel title="Costs paid at cost" flush>{expenses.length ? <ul className="divide-y">{expenses.map((e) => <Row key={e.id} href={`/finance/property-expenses/${e.id}`} a={e.description} b={`${formatDate(e.expense_date)} · ${e.category}`} amount={`−${money(e.amount)}`} tone="text-amber-600" />)}</ul> : <EmptyState icon={Building2} title="No costs in this period" />}</Panel>
                    <Panel title="Paid to owner" flush>{payouts.length ? <ul className="divide-y">{payouts.map((p) => <Row key={p.id} href={`/finance/owner-payouts/${p.id}`} a={p.payout_number} b={`${formatDate(p.payout_date)} · ${methodLabel(p.payment_method)}`} amount={money(p.amount)} tone="text-sky-600" />)}</ul> : <EmptyState icon={Landmark} title="No payouts in this period" />}</Panel>
                </div>
                <Can permission="finance.manage"><Panel title="Management fee terms" description="How SOMFIX earns on this property" className="max-w-xl"><FeeTermsForm key={property.updated_at} owner={position} defaults={defaults} /></Panel></Can>
            </div>
        </>
    );
}
OwnerShow.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }, { title: 'Owners', href: '/finance/owners' }] });
