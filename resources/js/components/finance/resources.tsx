import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle,
    Banknote,
    Building2,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    Coins,
    HandCoins,
    Landmark,
    Receipt,
    ShoppingBag,
    TrendingUp,
    UserRound,
    Users,
    Wallet,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { BarList } from './charts';
import { formatDate, formatMonth, methodLabel, personName } from './format';
import { StatusBadge, type Kpi, type Option } from './kit';

type Money = (v: number | string | null | undefined, o?: { compact?: boolean; signed?: boolean }) => string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
export type Ctx = { money: Money; options: Record<string, Any> };
export type Values = Record<string, string>;

export type FieldDef = {
    name: string;
    label: string;
    type: 'text' | 'money' | 'percent' | 'date' | 'month' | 'select' | 'textarea';
    span?: 2;
    required?: boolean;
    hint?: ReactNode;
    options?: (ctx: Ctx, values: Values) => Option[];
    allowEmpty?: string;
    showIf?: (v: Values) => boolean;
    lockedOnEdit?: boolean;
};

export type Section = { title: string; items: { label: string; value: ReactNode }[] };

export type ResourceConfig = {
    key: string;
    singular: string;
    plural: string;
    icon: LucideIcon;
    description: string;
    base: string;
    canDelete?: (r: Any) => boolean;
    canEdit?: (r: Any) => boolean;
    searchHint: string;
    kpis: (stats: Any, ctx: Ctx) => Kpi[];
    columns: (ctx: Ctx) => ColumnDef<Any>[];
    filters?: { key: string; label: string; value: (r: Any) => string; options: (ctx: Ctx, rows: Any[]) => Option[] }[];
    insight?: (stats: Any) => { title: string; node: ReactNode } | null;
    fields: FieldDef[];
    seed?: (v: Values, ctx: Ctx) => Values;
    onChange?: (name: string, value: string, v: Values, ctx: Ctx) => Partial<Values>;
    preview?: (v: Values, ctx: Ctx) => ReactNode;
    transform?: (v: Values, editing: boolean) => Values | Record<string, unknown>;
    show: (r: Any, ctx: Ctx, detail: Any) => {
        title: string;
        subtitle?: string;
        status?: string;
        amount?: { label: string; value: string; tone?: 'success' | 'danger' | 'warning' | 'default' };
        sections: Section[];
        related: { label: string; text: string; href: string }[];
        notes?: string | null;
        alert?: ReactNode;
    };
    titleOf: (r: Any) => string;
};

const A = ({ href, children }: { href: string; children: ReactNode }) => (
    <Link href={href} className="font-medium text-primary hover:underline">
        {children}
    </Link>
);
const Sub = ({ children }: { children: ReactNode }) => <p className="max-w-[240px] truncate text-xs text-muted-foreground">{children}</p>;
const Num = ({ children, className = '' }: { children: ReactNode; className?: string }) => <span className={`font-semibold tabular-nums ${className}`}>{children}</span>;
const dash = <span className="text-muted-foreground">—</span>;

const methods = (c: Ctx): Option[] => Object.entries(c.options.methods ?? {}).map(([value, label]) => ({ value, label: String(label) }));
const strings = (list: string[] | undefined): Option[] => (list ?? []).map((v) => ({ value: v, label: v }));
const jobsOf = (c: Ctx): Option[] => (c.options.jobs ?? []).map((j: Any) => ({ value: String(j.id), label: `${j.job_number} — ${j.title}` }));
const propertiesOf = (c: Ctx): Option[] => (c.options.properties ?? []).map((p: Any) => ({ value: String(p.id), label: p.name + (p.owner_name ? ` · ${p.owner_name}` : '') }));

const col = (header: string, cell: (r: Any) => ReactNode, extra: Partial<ColumnDef<Any>> = {}): ColumnDef<Any> =>
    ({ id: header, header, cell: ({ row }: Any) => cell(row.original), ...extra }) as ColumnDef<Any>;

const textFilter = (name: string, accessor: (r: Any) => string): Partial<ColumnDef<Any>> => ({ accessorFn: accessor, id: name });

const jobCell = (r: Any) => (r.job ? <A href={`/finance/jobs/${r.job.id}`}>{r.job.job_number}</A> : dash);
const num = (v: unknown) => Number(v ?? 0);

/* ------------------------------------------------------------------ expenses */
const expenses: ResourceConfig = {
    key: 'expenses',
    singular: 'Expense',
    plural: 'Expenses',
    icon: Wallet,
    base: '/finance/expenses',
    description: "SOMFIX's own running costs — rent, fuel, tools, airtime. Link a cost to a job to see its true margin.",
    searchHint: 'Search description, vendor, category…',
    titleOf: (r) => r.expense_number,
    kpis: (s, { money }) => [
        { title: 'Spent this month', value: s.thisMonth, icon: CalendarClock, tone: 'warning', hint: `${s.count} expenses recorded` },
        { title: 'Total expenses', value: s.total, icon: Wallet, tone: 'primary', compact: true },
        { title: 'Awaiting payment', value: s.pending, icon: AlertTriangle, tone: s.pending > 0 ? 'danger' : 'neutral', hint: `${s.pendingCount} pending` },
        { title: 'Charged to jobs', value: s.jobLinked, icon: Wrench, tone: 'info', hint: money(s.jobLinked) !== money(0) ? 'Reduces job margin' : 'No job-linked costs yet' },
    ],
    insight: (s) => ({ title: 'Spend by category', node: <BarList data={s.byCategory ?? []} color="#f59e0b" /> }),
    filters: [
        { key: 'status', label: 'Status', value: (r) => r.status, options: () => ['paid', 'pending', 'cancelled'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })) },
        { key: 'category', label: 'Category', value: (r) => r.category, options: (c) => strings(c.options.categories) },
    ],
    columns: ({ money }) => [
        col('Expense', (r) => (
            <div>
                <A href={`/finance/expenses/${r.id}`}>{r.expense_number}</A>
                <Sub>{r.description}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.expense_number} ${r.description} ${r.vendor ?? ''}`, id: 'expense' }),
        col('Category', (r) => r.category, textFilter('category', (r) => r.category)),
        col('Vendor', (r) => r.vendor ?? dash),
        col('Job', jobCell),
        col('Method', (r) => methodLabel(r.payment_method)),
        col('Date', (r) => formatDate(r.expense_date), { accessorFn: (r) => r.expense_date, id: 'date' }),
        col('Amount', (r) => <Num className={r.status === 'cancelled' ? 'text-muted-foreground line-through' : ''}>{money(r.amount)}</Num>, { accessorFn: (r) => num(r.amount), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Status', (r) => <StatusBadge status={r.status} />, { accessorFn: (r) => r.status, id: 'status' }),
    ],
    fields: [
        { name: 'expense_date', label: 'Date', type: 'date', required: true },
        { name: 'category', label: 'Category', type: 'select', required: true, options: (c) => strings(c.options.categories) },
        { name: 'description', label: 'Description', type: 'text', required: true, span: 2 },
        { name: 'vendor', label: 'Paid to (vendor)', type: 'text' },
        { name: 'amount', label: 'Amount', type: 'money', required: true },
        { name: 'payment_method', label: 'Payment method', type: 'select', required: true, options: methods },
        { name: 'status', label: 'Status', type: 'select', required: true, options: () => [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'cancelled', label: 'Cancelled' }] },
        { name: 'reference', label: 'Receipt / reference', type: 'text' },
        { name: 'approved_by', label: 'Approved by', type: 'text' },
        { name: 'job_id', label: 'Charge to job (optional)', type: 'select', allowEmpty: 'Not linked to a job', options: jobsOf, span: 2, hint: 'Linking a cost to a job deducts it from that job’s margin.' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, expense_date: v.expense_date || new Date().toISOString().slice(0, 10), payment_method: v.payment_method || 'cash', status: v.status || 'paid' }),
    show: (r, { money }) => ({
        title: r.description,
        subtitle: `${r.expense_number} · ${r.category}`,
        status: r.status,
        amount: { label: 'Amount', value: money(r.amount), tone: 'danger' },
        sections: [
            { title: 'Expense', items: [{ label: 'Date', value: formatDate(r.expense_date) }, { label: 'Category', value: r.category }, { label: 'Paid to', value: r.vendor }, { label: 'Receipt / reference', value: r.reference }] },
            { title: 'Payment', items: [{ label: 'Method', value: methodLabel(r.payment_method) }, { label: 'Approved by', value: r.approved_by }, { label: 'Status', value: <StatusBadge status={r.status} /> }] },
        ],
        related: r.job ? [{ label: 'Charged to job', text: `${r.job.job_number} — ${r.job.title}`, href: `/finance/jobs/${r.job.id}` }] : [],
        notes: r.notes,
    }),
};

/* ------------------------------------------------------------------ payments */
const payments: ResourceConfig = {
    key: 'payments',
    singular: 'Payment',
    plural: 'Customer Payments',
    icon: HandCoins,
    base: '/finance/payments',
    description: 'Money received from customers against invoices. Recording a payment updates the invoice balance and the job’s collected amount.',
    searchHint: 'Search payment, invoice, customer, reference…',
    titleOf: (r) => r.payment_number,
    kpis: (s) => [
        { title: 'Received this month', value: s.thisMonth, icon: CalendarClock, tone: 'success', hint: `${s.count} payments in total` },
        { title: 'Total received', value: s.total, icon: HandCoins, tone: 'primary', compact: true },
        { title: 'Still to collect', value: s.outstanding, icon: AlertTriangle, tone: s.outstanding > 0 ? 'warning' : 'neutral', hint: 'Open invoice balances' },
        { title: 'Payments logged', value: s.count, format: 'number', icon: Receipt, tone: 'info' },
    ],
    insight: (s) => ({ title: 'Received by method', node: <BarList data={s.byMethod ?? []} color="#0ea5e9" /> }),
    filters: [{ key: 'method', label: 'Method', value: (r) => r.method, options: (c) => methods(c) }],
    columns: ({ money }) => [
        col('Payment', (r) => (
            <div>
                <A href={`/finance/payments/${r.id}`}>{r.payment_number}</A>
                <Sub>{r.reference || 'No reference'}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.payment_number} ${r.reference ?? ''}`, id: 'payment' }),
        col('Invoice', (r) => (r.invoice ? <A href={`/finance/invoices/${r.invoice.id}`}>{r.invoice.invoice_number}</A> : dash), { accessorFn: (r) => r.invoice?.invoice_number ?? '', id: 'invoice' }),
        col('Customer', (r) => <span>{r.invoice?.job?.customer?.name ?? r.invoice?.recipient_name ?? '—'}</span>, { accessorFn: (r) => r.invoice?.job?.customer?.name ?? r.invoice?.recipient_name ?? '', id: 'customer' }),
        col('Job', (r) => (r.invoice?.job ? <A href={`/finance/jobs/${r.invoice.job.id}`}>{r.invoice.job.job_number}</A> : dash)),
        col('Method', (r) => methodLabel(r.method), { accessorFn: (r) => r.method, id: 'method' }),
        col('Received', (r) => formatDate(r.paid_at), { accessorFn: (r) => r.paid_at, id: 'date' }),
        col('Amount', (r) => <Num className="text-emerald-600 dark:text-emerald-300">{money(r.amount)}</Num>, { accessorFn: (r) => num(r.amount), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
    ],
    fields: [
        {
            name: 'finance_id', label: 'Invoice', type: 'select', required: true, span: 2, lockedOnEdit: true, hint: 'Only issued invoices with a balance are listed.',
            options: (c) => (c.options.invoices ?? []).map((i: Any) => ({ value: String(i.id), label: `${i.invoice_number} · ${i.client ?? i.title} · balance ${c.money(i.balance)}` })),
        },
        { name: 'amount', label: 'Amount received', type: 'money', required: true },
        { name: 'paid_at', label: 'Date received', type: 'date', required: true },
        { name: 'method', label: 'Payment method', type: 'select', required: true, options: methods },
        { name: 'reference', label: 'Reference / transaction ID', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, method: v.method || 'cash', paid_at: v.paid_at || new Date().toISOString().slice(0, 10) }),
    onChange: (name, value, _v, { options }) => {
        if (name !== 'finance_id') return {};
        const inv = (options.invoices ?? []).find((i: Any) => String(i.id) === value);
        return inv ? { amount: String(inv.balance) } : {};
    },
    preview: (v, { money, options }) => {
        const inv = (options.invoices ?? []).find((i: Any) => String(i.id) === v.finance_id);
        if (!inv) return null;
        const after = Math.max(0, inv.balance - num(v.amount));
        return <Calc rows={[['Invoice total', money(inv.amount)], ['Balance before', money(inv.balance)], ['This payment', money(num(v.amount))], ['Balance after', money(after)]]} highlight={after === 0 ? 'Invoice will be marked PAID' : undefined} />;
    },
    transform: (v, editing) => {
        const data: Record<string, unknown> = { ...v };
        if (editing) delete data.finance_id;
        return data;
    },
    show: (r, { money }, detail) => ({
        title: r.payment_number,
        subtitle: `Received ${formatDate(r.paid_at)} via ${methodLabel(r.method)}`,
        status: 'paid',
        amount: { label: 'Amount received', value: money(r.amount), tone: 'success' },
        sections: [
            { title: 'Payment', items: [{ label: 'Method', value: methodLabel(r.method) }, { label: 'Reference', value: r.reference }, { label: 'Received by', value: r.received_by }, { label: 'Date', value: formatDate(r.paid_at) }] },
            { title: 'Invoice position', items: r.invoice ? [{ label: 'Invoice total', value: money(r.invoice.amount) }, { label: 'Paid so far', value: money(r.invoice.paid_amount) }, { label: 'Balance', value: money(r.invoice.balance) }, { label: 'Invoice status', value: <StatusBadge status={r.invoice.status} /> }] : [] },
            { title: 'All payments on this invoice', items: (detail.siblings ?? []).map((s: Any) => ({ label: `${s.payment_number} · ${formatDate(s.paid_at)}`, value: money(s.amount) })) },
        ],
        related: [
            ...(r.invoice ? [{ label: 'Invoice', text: `${r.invoice.invoice_number} — ${r.invoice.title}`, href: `/finance/invoices/${r.invoice.id}` }] : []),
            ...(r.invoice?.job ? [{ label: 'Job', text: `${r.invoice.job.job_number} — ${r.invoice.job.title}`, href: `/finance/jobs/${r.invoice.job.id}` }] : []),
            { label: 'Printable receipt', text: 'Open receipt', href: `/sales/payments/${r.id}/receipt` },
        ],
        notes: r.notes,
    }),
};

/* --------------------------------------------------------------- commissions */
const commissionStatusOpts = () => [{ value: 'pending', label: 'Pending (owed)' }, { value: 'paid', label: 'Paid' }, { value: 'cancelled', label: 'Cancelled' }];
const commissions: ResourceConfig = {
    key: 'commissions',
    singular: 'Commission',
    plural: 'Technician Commissions',
    icon: Coins,
    base: '/finance/commissions',
    description: 'What external technicians earn from each job: a share of the service fee (invoice minus materials at cost).',
    searchHint: 'Search technician, job, commission number…',
    titleOf: (r) => r.payout_number,
    kpis: (s) => [
        { title: 'Owed to technicians', value: s.pending, icon: AlertTriangle, tone: s.pending > 0 ? 'warning' : 'neutral', hint: `${s.pendingCount} commissions unpaid` },
        { title: 'Total earned', value: s.earned, icon: Coins, tone: 'primary', compact: true },
        { title: 'Paid out', value: s.paid, icon: CheckCircle2, tone: 'success', compact: true },
        { title: 'Technicians earning', value: s.technicians, format: 'number', icon: Users, tone: 'info' },
    ],
    insight: (s) => ({ title: 'Earnings by technician', node: <BarList data={s.byTechnician ?? []} color="#8b5cf6" /> }),
    filters: [{ key: 'status', label: 'Status', value: (r) => r.status, options: () => commissionStatusOpts() }],
    columns: ({ money }) => [
        col('Commission', (r) => (
            <div>
                <A href={`/finance/commissions/${r.id}`}>{r.payout_number}</A>
                <Sub>{r.notes || 'Job commission'}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.payout_number} ${r.notes ?? ''}`, id: 'commission' }),
        col('Technician', (r) => (r.service_team ? <A href={`/finance/technicians/${r.service_team.id}`}>{r.service_team.name}</A> : dash), { accessorFn: (r) => r.service_team?.name ?? '', id: 'technician' }),
        col('Job', jobCell, { accessorFn: (r) => r.job?.job_number ?? '', id: 'job' }),
        col('Earned', (r) => formatDate(r.earned_date), { accessorFn: (r) => r.earned_date, id: 'date' }),
        col('Service fee', (r) => <span className="tabular-nums">{money(r.base_amount)}</span>, { accessorFn: (r) => num(r.base_amount), id: 'base', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Rate', (r) => `${num(r.percent)}%`),
        col('Commission', (r) => <Num>{money(r.amount)}</Num>, { accessorFn: (r) => num(r.amount), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Status', (r) => <StatusBadge status={r.status} />, { accessorFn: (r) => r.status, id: 'status' }),
    ],
    fields: [
        { name: 'service_team_id', label: 'Technician', type: 'select', required: true, hint: 'Only external (commission-based) technicians are listed.', options: (c) => (c.options.technicians ?? []).map((t: Any) => ({ value: String(t.id), label: `${t.name}${t.specialization ? ` · ${t.specialization}` : ''}` })) },
        { name: 'job_id', label: 'Job', type: 'select', allowEmpty: 'Not linked to a job', options: (c) => (c.options.jobs ?? []).map((j: Any) => ({ value: String(j.id), label: `${j.job_number} — ${j.title}` })) },
        { name: 'earned_date', label: 'Date earned', type: 'date', required: true },
        { name: 'base_amount', label: 'Service fee (commission base)', type: 'money', required: true, hint: 'Defaults to the job’s invoice minus materials at cost.' },
        { name: 'percent', label: 'Technician share', type: 'percent', required: true, hint: 'Defaults to the technician’s rate or the company default.' },
        { name: 'status', label: 'Status', type: 'select', required: true, options: commissionStatusOpts },
        { name: 'paid_at', label: 'Date paid', type: 'date', required: true, showIf: (v) => v.status === 'paid' },
        { name: 'payment_method', label: 'Paid via', type: 'select', required: true, options: methods, showIf: (v) => v.status === 'paid' },
        { name: 'reference', label: 'Reference', type: 'text', showIf: (v) => v.status === 'paid' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v, { options }) => {
        const t = (options.technicians ?? []).find((x: Any) => String(x.id) === v.service_team_id);
        return { ...v, status: v.status || 'pending', earned_date: v.earned_date || new Date().toISOString().slice(0, 10), percent: v.percent || (t ? String(t.effective_percent) : '') };
    },
    onChange: (name, value, v, { options }) => {
        if (name === 'service_team_id') {
            const t = (options.technicians ?? []).find((x: Any) => String(x.id) === value);
            return t ? { percent: String(t.effective_percent) } : {};
        }
        if (name === 'job_id') {
            const j = (options.jobs ?? []).find((x: Any) => String(x.id) === value);
            return j ? { base_amount: String(Math.max(0, j.service_fee)) } : {};
        }
        if (name === 'status' && value === 'paid') return { paid_at: v.paid_at || new Date().toISOString().slice(0, 10), payment_method: v.payment_method || 'cash' };
        return {};
    },
    preview: (v, { money, options }) => {
        const j = (options.jobs ?? []).find((x: Any) => String(x.id) === v.job_id);
        const commission = Math.round(num(v.base_amount) * num(v.percent)) / 100;
        return (
            <Calc
                rows={[
                    ...(j ? ([['Job invoiced', money(j.billed)], ['Collected from customer', money(j.collected)], ['Service fee (invoice − materials)', money(j.service_fee)], ['Commission already on this job', money(j.commission)]] as [string, string][]) : []),
                    ['Technician share', `${num(v.percent)}% of ${money(num(v.base_amount))}`],
                    ['Commission', money(commission)],
                    ['SOMFIX keeps', money(num(v.base_amount) - commission)],
                ]}
                highlight={j && j.collected < j.billed ? 'The customer has not fully paid this job yet.' : undefined}
                warn
            />
        );
    },
    show: (r, { money }, detail) => {
        const job = detail.job;
        return {
            title: r.service_team?.name ?? 'Commission',
            subtitle: `${r.payout_number} · earned ${formatDate(r.earned_date)}`,
            status: r.status,
            amount: { label: 'Commission', value: money(r.amount), tone: r.status === 'paid' ? 'success' : 'warning' },
            alert: r.status === 'pending' && job && job.outstanding > 0 ? <>The customer still owes {money(job.outstanding)} on {job.job_number}. Consider paying the technician once the job is collected.</> : null,
            sections: [
                { title: 'Calculation', items: [{ label: 'Service fee (base)', value: money(r.base_amount) }, { label: 'Technician share', value: `${num(r.percent)}%` }, { label: 'Commission', value: money(r.amount) }, { label: 'SOMFIX keeps', value: money(num(r.base_amount) - num(r.amount)) }] },
                { title: 'Payment', items: [{ label: 'Status', value: <StatusBadge status={r.status} /> }, { label: 'Paid on', value: r.paid_at ? formatDate(r.paid_at) : null }, { label: 'Paid via', value: r.payment_method ? methodLabel(r.payment_method) : null }, { label: 'Reference', value: r.reference }] },
                ...(job ? [{ title: 'Job position', items: [{ label: 'Invoiced', value: money(job.billed) }, { label: 'Collected', value: money(job.collected) }, { label: 'Materials at cost', value: money(job.materials_cost) }, { label: 'Net margin after all costs', value: money(job.net_margin) }] }] : []),
            ],
            related: [
                ...(r.service_team ? [{ label: 'Technician', text: `${r.service_team.name}${r.service_team.specialization ? ` · ${r.service_team.specialization}` : ''}`, href: `/finance/technicians/${r.service_team.id}` }] : []),
                ...(r.job ? [{ label: 'Job', text: `${r.job.job_number} — ${r.job.title}`, href: `/finance/jobs/${r.job.id}` }] : []),
            ],
            notes: r.notes,
        };
    },
};

/* ------------------------------------------------------------------- payroll */
const payroll: ResourceConfig = {
    key: 'payroll',
    singular: 'Payroll entry',
    plural: 'Payroll',
    icon: Banknote,
    base: '/finance/payroll',
    description: 'Monthly salaries for in-house employees: basic, allowances, overtime, bonus, deductions and net pay.',
    searchHint: 'Search employee, month, payroll number…',
    titleOf: (r) => r.payroll_number,
    kpis: (s) => [
        { title: 'Payroll this month (net)', value: s.monthNet, icon: Banknote, tone: 'primary', hint: `Gross ${s.monthGross.toFixed(2)}` },
        { title: 'Unpaid salaries', value: s.unpaid, icon: AlertTriangle, tone: s.unpaid > 0 ? 'warning' : 'neutral', hint: `${s.unpaidCount} lines pending` },
        { title: 'Paid this year', value: s.paidYtd, icon: CheckCircle2, tone: 'success', compact: true },
        { title: 'Active employees', value: s.staff, format: 'number', icon: Users, tone: 'info' },
    ],
    filters: [{ key: 'status', label: 'Status', value: (r) => r.status, options: () => [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }] }],
    columns: ({ money }) => [
        col('Employee', (r) => (
            <div>
                <A href={`/finance/payroll/${r.id}`}>{r.service_team?.name ?? '—'}</A>
                <Sub>{r.payroll_number}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.service_team?.name ?? ''} ${r.payroll_number}`, id: 'employee' }),
        col('Month', (r) => formatMonth(r.pay_month), { accessorFn: (r) => r.pay_month, id: 'month' }),
        col('Gross', (r) => <span className="tabular-nums">{money(r.gross_pay)}</span>, { accessorFn: (r) => num(r.gross_pay), id: 'gross', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Deductions', (r) => <span className="tabular-nums text-destructive">{num(r.total_deductions) ? `-${money(r.total_deductions)}` : '—'}</span>, { meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Net pay', (r) => <Num>{money(r.net_pay)}</Num>, { accessorFn: (r) => num(r.net_pay), id: 'net', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Paid on', (r) => (r.paid_at ? formatDate(r.paid_at) : dash)),
        col('Status', (r) => <StatusBadge status={r.status} />, { accessorFn: (r) => r.status, id: 'status' }),
    ],
    fields: [
        { name: 'service_team_id', label: 'Employee', type: 'select', required: true, hint: 'Only in-house employees. Set a technician’s salary on Technician Pay.', options: (c) => (c.options.staff ?? []).map((t: Any) => ({ value: String(t.id), label: `${t.name}${t.specialization ? ` · ${t.specialization}` : ''}` })) },
        { name: 'pay_month', label: 'Pay month', type: 'month', required: true },
        { name: 'basic_salary', label: 'Basic salary', type: 'money', required: true },
        { name: 'allowances', label: 'Allowances', type: 'money' },
        { name: 'overtime', label: 'Overtime', type: 'money' },
        { name: 'bonus', label: 'Bonus', type: 'money' },
        { name: 'advance_deduction', label: 'Advance / loan deduction', type: 'money' },
        { name: 'absence_deduction', label: 'Absence deduction', type: 'money' },
        { name: 'other_deduction', label: 'Tax / other deduction', type: 'money' },
        { name: 'status', label: 'Status', type: 'select', required: true, options: () => [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }] },
        { name: 'paid_at', label: 'Date paid', type: 'date', required: true, showIf: (v) => v.status === 'paid' },
        { name: 'payment_method', label: 'Paid via', type: 'select', required: true, options: methods, showIf: (v) => v.status === 'paid' },
        { name: 'reference', label: 'Reference', type: 'text', showIf: (v) => v.status === 'paid' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, status: v.status || 'pending' }),
    onChange: (name, value, v, { options }) => {
        if (name === 'service_team_id') {
            const t = (options.staff ?? []).find((x: Any) => String(x.id) === value);
            return t ? { basic_salary: String(num(t.monthly_salary)), allowances: String(num(t.monthly_allowances)) } : {};
        }
        if (name === 'status' && value === 'paid') return { paid_at: v.paid_at || new Date().toISOString().slice(0, 10), payment_method: v.payment_method || 'evc_plus' };
        return {};
    },
    preview: (v, { money }) => {
        const gross = num(v.basic_salary) + num(v.allowances) + num(v.overtime) + num(v.bonus);
        const ded = num(v.advance_deduction) + num(v.absence_deduction) + num(v.other_deduction);
        return <Calc rows={[['Gross pay', money(gross)], ['Total deductions', `-${money(ded)}`], ['Net pay', money(gross - ded)]]} highlight={gross - ded < 0 ? 'Deductions are more than gross pay.' : undefined} warn={gross - ded < 0} />;
    },
    show: (r, { money }) => ({
        title: r.service_team?.name ?? 'Payroll',
        subtitle: `${r.payroll_number} · ${formatMonth(r.pay_month)}`,
        status: r.status,
        amount: { label: 'Net pay', value: money(r.net_pay), tone: r.status === 'paid' ? 'success' : 'warning' },
        sections: [
            { title: 'Earnings', items: [{ label: 'Basic salary', value: money(r.basic_salary) }, { label: 'Allowances', value: money(r.allowances) }, { label: 'Overtime', value: money(r.overtime) }, { label: 'Bonus', value: money(r.bonus) }, { label: 'Gross pay', value: money(r.gross_pay) }] },
            { title: 'Deductions', items: [{ label: 'Advance / loan', value: money(r.advance_deduction) }, { label: 'Absence', value: money(r.absence_deduction) }, { label: 'Tax / other', value: money(r.other_deduction) }, { label: 'Total deductions', value: money(r.total_deductions) }] },
            { title: 'Payment', items: [{ label: 'Status', value: <StatusBadge status={r.status} /> }, { label: 'Paid on', value: r.paid_at ? formatDate(r.paid_at) : null }, { label: 'Paid via', value: r.payment_method ? methodLabel(r.payment_method) : null }, { label: 'Reference', value: r.reference }] },
        ],
        related: r.service_team ? [{ label: 'Employee', text: r.service_team.name, href: `/finance/technicians/${r.service_team.id}` }] : [],
        notes: r.notes,
    }),
};

/* ---------------------------------------------------------------------- rent */
const propertyOf = (ctx: Ctx, id: string) => (ctx.options.properties ?? []).find((p: Any) => String(p.id) === id);
const rent: ResourceConfig = {
    key: 'rent',
    singular: 'Rent collection',
    plural: 'Rent Collections',
    icon: Building2,
    base: '/finance/rent',
    description: 'Rent received for property owners. The rent belongs to the owner — SOMFIX keeps only its management fee.',
    searchHint: 'Search property, tenant, receipt…',
    titleOf: (r) => r.receipt_number,
    kpis: (s) => [
        { title: 'Rent collected', value: s.collected, icon: Building2, tone: 'primary', hint: `${s.count} receipts · ${s.monthCollected.toFixed(0)} this month`, compact: true },
        { title: 'SOMFIX fees earned', value: s.fees, icon: TrendingUp, tone: 'success', hint: 'Revenue from managing rent', compact: true },
        { title: 'Net to owners', value: s.netToOwners, icon: Landmark, tone: 'info', compact: true },
        { title: 'Tenant arrears', value: s.arrears, icon: AlertTriangle, tone: s.arrears > 0 ? 'danger' : 'neutral', compact: true },
    ],
    filters: [{ key: 'property', label: 'Property', value: (r) => String(r.property_id), options: (_c, rows) => Array.from(new Map(rows.map((r: Any) => [String(r.property_id), r.property?.name ?? '—'])).entries()).map(([value, label]) => ({ value, label: String(label) })) }],
    columns: ({ money }) => [
        col('Receipt', (r) => (
            <div>
                <A href={`/finance/rent/${r.id}`}>{r.receipt_number}</A>
                <Sub>{methodLabel(r.payment_method)}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.receipt_number} ${r.tenant_name ?? ''}`, id: 'receipt' }),
        col('Property', (r) => (
            <div>
                <p className="font-medium">{r.property?.name ?? '—'}</p>
                <Sub>{[r.unit?.unit_number ? `Unit ${r.unit.unit_number}` : null, r.tenant_name || personName(r.tenant)].filter(Boolean).join(' · ') || 'No tenant recorded'}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.property?.name ?? ''} ${r.tenant_name ?? ''}`, id: 'property' }),
        col('Rent for', (r) => formatMonth(r.rent_month), { accessorFn: (r) => r.rent_month, id: 'month' }),
        col('Received', (r) => formatDate(r.received_date), { accessorFn: (r) => r.received_date, id: 'date' }),
        col('Collected', (r) => <Num>{money(r.amount_collected)}</Num>, { accessorFn: (r) => num(r.amount_collected), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('SOMFIX fee', (r) => <span className="tabular-nums text-emerald-600 dark:text-emerald-300">{money(r.fee_amount)}</span>, { meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Net to owner', (r) => <span className="tabular-nums">{money(r.net_to_owner)}</span>, { meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
        col('Arrears', (r) => (num(r.arrears) > 0 ? <span className="tabular-nums text-destructive">{money(r.arrears)}</span> : dash), { meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
    ],
    fields: [
        { name: 'property_id', label: 'Property', type: 'select', required: true, span: 2, options: propertiesOf },
        { name: 'unit_id', label: 'Unit', type: 'select', allowEmpty: 'No specific unit', options: (c, v) => (c.options.units ?? []).filter((u: Any) => String(u.property_id) === v.property_id).map((u: Any) => ({ value: String(u.id), label: `Unit ${u.unit_number}` })) },
        { name: 'tenant_id', label: 'Tenant', type: 'select', allowEmpty: 'Not on the tenant list', options: (c, v) => (c.options.tenants ?? []).filter((t: Any) => !v.unit_id || String(t.unit_id) === v.unit_id).map((t: Any) => ({ value: String(t.id), label: personName(t) })) },
        { name: 'tenant_name', label: 'Tenant name (if not listed)', type: 'text', span: 2 },
        { name: 'rent_month', label: 'Rent for month', type: 'month', required: true },
        { name: 'received_date', label: 'Date received', type: 'date', required: true },
        { name: 'rent_due', label: 'Rent due', type: 'money', hint: 'Leave blank if the full rent was paid.' },
        { name: 'amount_collected', label: 'Amount collected', type: 'money', required: true },
        { name: 'payment_method', label: 'Payment method', type: 'select', required: true, options: methods },
        { name: 'reference', label: 'Reference', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, payment_method: v.payment_method || 'cash' }),
    onChange: (name, value, v, ctx) => {
        if (name === 'property_id') return { unit_id: '', tenant_id: '' };
        if (name === 'unit_id') {
            const u = (ctx.options.units ?? []).find((x: Any) => String(x.id) === value);
            const t = (ctx.options.tenants ?? []).find((x: Any) => String(x.unit_id) === value);
            return { ...(u?.monthly_rent && !v.rent_due ? { rent_due: String(num(u.monthly_rent)), amount_collected: v.amount_collected || String(num(u.monthly_rent)) } : {}), ...(t ? { tenant_id: String(t.id) } : {}) };
        }
        return {};
    },
    preview: (v, ctx) => {
        const p = propertyOf(ctx, v.property_id);
        if (!p) return null;
        const collected = num(v.amount_collected);
        const fee = p.fee_type === 'fixed_per_unit' ? (collected > 0 ? p.fee_fixed : 0) : (collected * p.fee_percent) / 100;
        const f = Math.round(Math.min(fee, collected) * 100) / 100;
        return (
            <Calc
                rows={[
                    ['Fee terms', p.fee_type === 'fixed_per_unit' ? `${ctx.money(p.fee_fixed)} per unit / month` : `${p.fee_percent}% of rent collected`],
                    ['Rent collected', ctx.money(collected)],
                    ['SOMFIX fee (revenue)', ctx.money(f)],
                    ['Net to owner', ctx.money(collected - f)],
                ]}
            />
        );
    },
    show: (r, { money }) => ({
        title: r.property?.name ?? 'Rent collection',
        subtitle: `${r.receipt_number} · rent for ${formatMonth(r.rent_month)}`,
        amount: { label: 'Rent collected', value: money(r.amount_collected), tone: 'success' },
        sections: [
            { title: 'Split of this payment', items: [{ label: 'Rent collected', value: money(r.amount_collected) }, { label: `SOMFIX fee (${r.fee_type === 'fixed_per_unit' ? 'fixed per unit' : '% of collections'})`, value: money(r.fee_amount) }, { label: 'Net to owner', value: money(r.net_to_owner) }] },
            { title: 'Rent', items: [{ label: 'Rent due', value: money(r.rent_due) }, { label: 'Arrears', value: money(r.arrears) }, { label: 'Month', value: formatMonth(r.rent_month) }, { label: 'Received', value: formatDate(r.received_date) }] },
            { title: 'Tenant & payment', items: [{ label: 'Tenant', value: r.tenant_name || personName(r.tenant) }, { label: 'Unit', value: r.unit?.unit_number }, { label: 'Method', value: methodLabel(r.payment_method) }, { label: 'Reference', value: r.reference }] },
        ],
        related: r.property ? [{ label: 'Owner statement', text: `${r.property.name}${r.property.owner_name ? ` · ${r.property.owner_name}` : ''}`, href: `/finance/owners/${r.property.id}` }] : [],
        notes: r.notes,
    }),
};

/* -------------------------------------------------------- owner expenses */
const propertyExpenses: ResourceConfig = {
    key: 'property-expenses',
    singular: 'Owner expense',
    plural: 'Owner Expenses',
    icon: ShoppingBag,
    base: '/finance/property-expenses',
    description: 'Costs SOMFIX pays on behalf of owners (repairs, utilities, security). Charged at cost and deducted from the owner’s balance — not SOMFIX’s expense.',
    searchHint: 'Search property, vendor, description…',
    titleOf: (r) => r.expense_number,
    kpis: (s) => [
        { title: 'This month', value: s.thisMonth, icon: CalendarClock, tone: 'warning', hint: `${s.count} costs recorded` },
        { title: 'Total at cost', value: s.total, icon: ShoppingBag, tone: 'primary', compact: true },
        { title: 'Properties charged', value: s.properties, format: 'number', icon: Building2, tone: 'info' },
    ],
    insight: (s) => ({ title: 'Owner costs by category', node: <BarList data={s.byCategory ?? []} color="#14b8a6" /> }),
    filters: [{ key: 'category', label: 'Category', value: (r) => r.category, options: (c) => strings(c.options.categories) }],
    columns: ({ money }) => [
        col('Expense', (r) => (
            <div>
                <A href={`/finance/property-expenses/${r.id}`}>{r.expense_number}</A>
                <Sub>{r.description}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.expense_number} ${r.description} ${r.vendor ?? ''}`, id: 'expense' }),
        col('Property', (r) => (r.property ? <A href={`/finance/owners/${r.property.id}`}>{r.property.name}</A> : dash), { accessorFn: (r) => r.property?.name ?? '', id: 'property' }),
        col('Category', (r) => r.category, textFilter('category', (r) => r.category)),
        col('Vendor', (r) => r.vendor ?? dash),
        col('Job', jobCell),
        col('Date', (r) => formatDate(r.expense_date), { accessorFn: (r) => r.expense_date, id: 'date' }),
        col('At cost', (r) => <Num>{money(r.amount)}</Num>, { accessorFn: (r) => num(r.amount), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
    ],
    fields: [
        { name: 'property_id', label: 'Property (owner)', type: 'select', required: true, span: 2, options: propertiesOf },
        { name: 'expense_date', label: 'Date', type: 'date', required: true },
        { name: 'category', label: 'Category', type: 'select', required: true, options: (c) => strings(c.options.categories) },
        { name: 'description', label: 'Description', type: 'text', required: true, span: 2 },
        { name: 'vendor', label: 'Paid to (vendor)', type: 'text' },
        { name: 'amount', label: 'Amount at cost', type: 'money', required: true },
        { name: 'payment_method', label: 'Payment method', type: 'select', required: true, options: methods },
        { name: 'reference', label: 'Receipt / reference', type: 'text' },
        { name: 'job_id', label: 'Related SOMFIX job (optional)', type: 'select', allowEmpty: 'Not linked to a job', options: jobsOf, span: 2 },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, expense_date: v.expense_date || new Date().toISOString().slice(0, 10), payment_method: v.payment_method || 'cash' }),
    show: (r, { money }) => ({
        title: r.description,
        subtitle: `${r.expense_number} · ${r.category}`,
        amount: { label: 'Charged to owner at cost', value: money(r.amount), tone: 'warning' },
        sections: [
            { title: 'Expense', items: [{ label: 'Date', value: formatDate(r.expense_date) }, { label: 'Category', value: r.category }, { label: 'Paid to', value: r.vendor }, { label: 'Reference', value: r.reference }, { label: 'Method', value: methodLabel(r.payment_method) }] },
        ],
        related: [
            ...(r.property ? [{ label: 'Property / owner', text: `${r.property.name}${r.property.owner_name ? ` · ${r.property.owner_name}` : ''}`, href: `/finance/owners/${r.property.id}` }] : []),
            ...(r.job ? [{ label: 'Job', text: `${r.job.job_number} — ${r.job.title}`, href: `/finance/jobs/${r.job.id}` }] : []),
        ],
        notes: r.notes,
    }),
};

/* --------------------------------------------------------- owner payouts */
const ownerPayouts: ResourceConfig = {
    key: 'owner-payouts',
    singular: 'Owner payout',
    plural: 'Owner Payouts',
    icon: Landmark,
    base: '/finance/owner-payouts',
    description: 'Rent money remitted to property owners. A payout can never exceed the balance owed to that owner.',
    searchHint: 'Search property, owner, reference…',
    titleOf: (r) => r.payout_number,
    kpis: (s) => [
        { title: 'Still owed to owners', value: s.owedNow, icon: AlertTriangle, tone: s.owedNow > 0 ? 'warning' : 'neutral', compact: true },
        { title: 'Paid this month', value: s.thisMonth, icon: CalendarClock, tone: 'info' },
        { title: 'Total remitted', value: s.total, icon: Landmark, tone: 'primary', compact: true, hint: `${s.count} payouts` },
    ],
    columns: ({ money }) => [
        col('Payout', (r) => (
            <div>
                <A href={`/finance/owner-payouts/${r.id}`}>{r.payout_number}</A>
                <Sub>{r.reference || 'No reference'}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.payout_number} ${r.reference ?? ''}`, id: 'payout' }),
        col('Property / owner', (r) => (
            <div>
                <p className="font-medium">{r.property?.name ?? '—'}</p>
                <Sub>{r.property?.owner_name ?? ''}</Sub>
            </div>
        ), { accessorFn: (r) => `${r.property?.name ?? ''} ${r.property?.owner_name ?? ''}`, id: 'property' }),
        col('Method', (r) => methodLabel(r.payment_method)),
        col('Date', (r) => formatDate(r.payout_date), { accessorFn: (r) => r.payout_date, id: 'date' }),
        col('Amount', (r) => <Num>{money(r.amount)}</Num>, { accessorFn: (r) => num(r.amount), id: 'amount', meta: { thClassName: 'text-right', tdClassName: 'text-right' } }),
    ],
    fields: [
        { name: 'property_id', label: 'Property (owner)', type: 'select', required: true, span: 2, options: (c) => (c.options.properties ?? []).map((p: Any) => ({ value: String(p.id), label: `${p.name}${p.owner_name ? ` · ${p.owner_name}` : ''} — owed ${c.money(p.balance)}` })) },
        { name: 'payout_date', label: 'Date paid', type: 'date', required: true },
        { name: 'amount', label: 'Amount paid to owner', type: 'money', required: true },
        { name: 'payment_method', label: 'Payment method', type: 'select', required: true, options: methods },
        { name: 'reference', label: 'Reference', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea', span: 2 },
    ],
    seed: (v) => ({ ...v, payout_date: v.payout_date || new Date().toISOString().slice(0, 10), payment_method: v.payment_method || 'bank_transfer' }),
    onChange: (name, value, _v, { options }) => {
        if (name !== 'property_id') return {};
        const p = (options.properties ?? []).find((x: Any) => String(x.id) === value);
        return p && p.balance > 0 ? { amount: String(p.balance) } : {};
    },
    preview: (v, { money, options }) => {
        const p = (options.properties ?? []).find((x: Any) => String(x.id) === v.property_id);
        if (!p) return null;
        const left = p.balance - num(v.amount);
        return <Calc rows={[['Owed to owner now', money(p.balance)], ['This payout', money(num(v.amount))], ['Still owed afterwards', money(left)]]} highlight={left < -0.001 ? 'This is more than the balance owed.' : undefined} warn={left < -0.001} />;
    },
    show: (r, { money }) => ({
        title: r.property?.name ?? 'Owner payout',
        subtitle: `${r.payout_number} · ${formatDate(r.payout_date)}`,
        amount: { label: 'Paid to owner', value: money(r.amount), tone: 'success' },
        sections: [{ title: 'Payout', items: [{ label: 'Owner', value: r.property?.owner_name }, { label: 'Date', value: formatDate(r.payout_date) }, { label: 'Method', value: methodLabel(r.payment_method) }, { label: 'Reference', value: r.reference }] }],
        related: r.property ? [{ label: 'Owner statement', text: r.property.name, href: `/finance/owners/${r.property.id}` }] : [],
        notes: r.notes,
    }),
};

export const RESOURCES: Record<string, ResourceConfig> = {
    expenses,
    payments,
    commissions,
    payroll,
    rent,
    'property-expenses': propertyExpenses,
    'owner-payouts': ownerPayouts,
};

/** Small calculation card used beside forms. */
export function Calc({ rows, highlight, warn }: { rows: [string, string][]; highlight?: string; warn?: boolean }) {
    return (
        <div className="rounded-lg border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live calculation</p>
            <dl className="grid gap-1.5 text-sm">
                {rows.map(([k, v], i) => (
                    <div key={k} className={`flex justify-between gap-4 ${i === rows.length - 1 ? 'mt-1 border-t pt-2 font-semibold' : ''}`}>
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="tabular-nums">{v}</dd>
                    </div>
                ))}
            </dl>
            {highlight && <p className={`mt-3 text-xs font-medium ${warn ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{highlight}</p>}
        </div>
    );
}

export const ICONS = { CircleDollarSign, UserRound };
