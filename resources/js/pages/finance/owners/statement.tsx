import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { formatDate, formatMonth, methodLabel } from '@/components/finance/format';
import { useMoney } from '@/components/finance/kit';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function OwnerStatement({ property, period, collections, expenses, payouts, totals, company }: { property: Any; period: { from: string; to: string }; collections: Any[]; expenses: Any[]; payouts: Any[]; totals: Record<string, number>; company: Any }) {
    const money = useMoney();
    useEffect(() => { const t = setTimeout(() => window.print(), 400); return () => clearTimeout(t); }, []);
    const th = 'border-b-2 border-black py-1 text-left text-xs uppercase';
    return (
        <>
            <Head title={`Owner statement — ${property.name}`} />
            <div className="mx-auto max-w-3xl bg-white p-8 text-sm text-black">
                <h1 className="text-2xl font-bold">{company.company_name} — Owner statement</h1>
                <p className="text-xs">{company.company_address} {company.company_phone} {company.company_email}</p>
                <p className="mt-4"><strong>{property.name}</strong> · Owner: {property.owner_name ?? '—'}</p>
                <p>Period: {formatDate(period.from)} to {formatDate(period.to)}</p>
                <h2 className="mt-5 font-semibold">Rent received</h2>
                <table className="w-full"><thead><tr><th className={th}>Date</th><th className={th}>For</th><th className={th}>Tenant</th><th className={`${th} text-right`}>Collected</th><th className={`${th} text-right`}>Fee</th></tr></thead><tbody>
                    {collections.map((c) => (<tr key={c.id}><td>{formatDate(c.received_date)}</td><td>{formatMonth(c.rent_month)}</td><td>{c.tenant_name}</td><td className="text-right">{money(c.amount_collected)}</td><td className="text-right">{money(c.fee_amount)}</td></tr>))}</tbody></table>
                <h2 className="mt-5 font-semibold">Costs paid on your behalf (at cost)</h2>
                <table className="w-full"><thead><tr><th className={th}>Date</th><th className={th}>Description</th><th className={`${th} text-right`}>Amount</th></tr></thead><tbody>
                    {expenses.map((e) => (<tr key={e.id}><td>{formatDate(e.expense_date)}</td><td>{e.description}</td><td className="text-right">{money(e.amount)}</td></tr>))}</tbody></table>
                <h2 className="mt-5 font-semibold">Paid to you</h2>
                <table className="w-full"><tbody>{payouts.map((p) => (<tr key={p.id}><td>{formatDate(p.payout_date)}</td><td>{methodLabel(p.payment_method)} {p.reference}</td><td className="text-right">{money(p.amount)}</td></tr>))}</tbody></table>
                <table className="mt-6 ml-auto w-72 border-t-2 border-black"><tbody>
                    <tr><td>Rent collected</td><td className="text-right">{money(totals.collected)}</td></tr>
                    <tr><td>Management fee</td><td className="text-right">−{money(totals.fees)}</td></tr>
                    <tr><td>Costs at cost</td><td className="text-right">−{money(totals.costs)}</td></tr>
                    <tr className="font-semibold"><td>Net due to owner</td><td className="text-right">{money(totals.netDue)}</td></tr>
                    <tr><td>Paid to owner</td><td className="text-right">−{money(totals.paid)}</td></tr>
                    <tr className="border-t font-bold"><td>Balance owed</td><td className="text-right">{money(totals.periodBalance)}</td></tr></tbody></table>
            </div>
        </>
    );
}
