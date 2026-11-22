import { Head, useForm } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { Can } from '@/components/can';
import { Field, MoneyInput, PageHeader, Panel, SubmitButton } from '@/components/finance/kit';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/use-permissions';
import type { BreadcrumbItem } from '@/types';

type S = Record<string, string | number | null>;

export default function FinanceSettings({ settings }: { settings: S }) {
    const { canManage } = usePermissions();
    const form = useForm({ company_name: String(settings.company_name ?? ''), company_address: String(settings.company_address ?? ''), company_phone: String(settings.company_phone ?? ''), company_email: String(settings.company_email ?? ''), currency: String(settings.currency ?? 'USD'), mgmt_fee_percent: String(settings.mgmt_fee_percent ?? ''), mgmt_fee_fixed: String(settings.mgmt_fee_fixed ?? ''), technician_commission_percent: String(settings.technician_commission_percent ?? '') });
    const e = form.errors as Record<string, string>;
    const set = (k: keyof typeof form.data) => (ev: React.ChangeEvent<HTMLInputElement>) => form.setData(k, ev.target.value);
    const ro = !canManage('finance');
    return (
        <>
            <Head title="Finance Settings" />
            <form onSubmit={(ev) => { ev.preventDefault(); form.put('/finance/settings', { preserveScroll: true }); }} className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 md:p-6">
                <PageHeader title="Finance settings" description="Company details for statements and the default rates every calculation uses when a property or technician has no rate of its own." icon={Settings} />
                <Panel title="Default earning rates" description="How SOMFIX earns — change these to match your agreements">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Management fee (% of rent)" error={e.mgmt_fee_percent} hint="Used when a property has no fee of its own."><MoneyInput disabled={ro} max="100" value={form.data.mgmt_fee_percent} onChange={set('mgmt_fee_percent')} /></Field>
                        <Field label="Fixed fee per unit / month" error={e.mgmt_fee_fixed} hint="For properties on a fixed fee."><MoneyInput disabled={ro} value={form.data.mgmt_fee_fixed} onChange={set('mgmt_fee_fixed')} /></Field>
                        <Field label="Technician share (% of service fee)" error={e.technician_commission_percent} hint="Used when a technician has no rate."><MoneyInput disabled={ro} max="100" value={form.data.technician_commission_percent} onChange={set('technician_commission_percent')} /></Field>
                    </div>
                </Panel>
                <Panel title="Company">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Company name" error={e.company_name} required><Input disabled={ro} value={form.data.company_name} onChange={set('company_name')} /></Field>
                        <Field label="Currency (ISO code)" error={e.currency} required><Input disabled={ro} maxLength={3} value={form.data.currency} onChange={set('currency')} /></Field>
                        <Field label="Address" error={e.company_address} className="sm:col-span-2"><Input disabled={ro} value={form.data.company_address} onChange={set('company_address')} /></Field>
                        <Field label="Phone" error={e.company_phone}><Input disabled={ro} value={form.data.company_phone} onChange={set('company_phone')} /></Field>
                        <Field label="Email" error={e.company_email}><Input disabled={ro} type="email" value={form.data.company_email} onChange={set('company_email')} /></Field>
                    </div>
                </Panel>
                <Can permission="finance.manage"><div className="flex justify-end"><SubmitButton processing={form.processing}>Save settings</SubmitButton></div></Can>
            </form>
        </>
    );
}
FinanceSettings.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance-report' }, { title: 'Settings', href: '/finance/settings' }] });
