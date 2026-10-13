import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Layers3,
    Plus,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

export type FinanceRow = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: string;
    currency: string;
    amount: string;
    paid_amount: string;
    balance: string;
    status: string;
    due_date: string | null;
    created_at: string;
    property: { id: number; name: string } | null;
    unit: { id: number; unit_number: string } | null;
    tenant: { id: number; first_name: string; last_name: string } | null;
    recipient_name: string | null;
};

const statusClass: Record<string, string> = {
    draft: badgeToneClasses.neutral,
    sent: badgeToneClasses.info,
    paid: badgeToneClasses.success,
    overdue: badgeToneClasses.danger,
    cancelled: badgeToneClasses.neutral,
};

export default function FinanceIndex({
    finances,
    invoices,
    quotations,
    stats,
}: {
    finances: FinanceRow[];
    invoices: FinanceRow[];
    quotations: FinanceRow[];
    stats: {
        totalRecords: number;
        totalAmount: number;
        totalPaid: number;
        totalBalance: number;
        invoicesCount: number;
        quotationsCount: number;
        invoicedAmount: number;
        quotedAmount: number;
    };
}) {
    const metrics: StatSection[] = [
        {
            title: 'Total Invoiced',
            value: `$${stats.invoicedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: `${stats.invoicesCount} invoices issued`,
            icon: Receipt,
            color: 'primary',
        },
        {
            title: 'Total Collected',
            value: `$${stats.totalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: 'Cash received to date',
            icon: CheckCircle2,
            color: 'success',
        },
        {
            title: 'Balance Due',
            value: `$${stats.totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: 'Pending receivables',
            icon: DollarSign,
            color: stats.totalBalance > 0 ? 'warning' : 'primary',
        },
        {
            title: 'Quoted Value',
            value: `$${stats.quotedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: `${stats.quotationsCount} proposals active`,
            icon: FileText,
            color: 'accent',
        },
    ];

    // Compute Collection Efficiency Rate
    const collectionRate =
        stats.invoicedAmount > 0
            ? Math.min(100, Math.round((stats.totalPaid / stats.invoicedAmount) * 100))
            : 0;

    const outstandingRate =
        stats.invoicedAmount > 0
            ? Math.min(100, Math.round((stats.totalBalance / stats.invoicedAmount) * 100))
            : 0;

    // Financial Momentum trend data
    const financialTrend = [
        { month: 'May', value: 38 },
        { month: 'Jun', value: 52 },
        { month: 'Jul', value: 68 },
        { month: 'Aug', value: 61 },
        { month: 'Sep', value: 84 },
        { month: 'Oct', value: 95 },
        { month: 'Nov', value: 88 },
    ];

    const chartPoints = financialTrend
        .map((item, index) => `${index * 88 + 18},${154 - item.value}`)
        .join(' ');
    const chartAreaPoints = `18,154 ${chartPoints} 546,154`;

    const recentRecords = finances.slice(0, 6);

    return (
        <>
            <Head title="Finance Overview — SOMFIX" />
            <div className="w-full p-4 md:p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">Finance Overview</h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            High-level operational summary of billed revenue, collections, outstanding receivables, and proposals.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/finance/quotations/create">
                                <Plus className="size-4 text-amber-600" />
                                New Quotation
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/finance/invoices/create">
                                <Plus className="size-4" />
                                New Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <StatsCard sections={metrics} />

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link
                        href="/finance/invoices/create"
                        className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                <Receipt className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                    Create Invoice
                                </h3>
                                <p className="text-xs text-muted-foreground">Bill tenant or client</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                            <span>Get started</span>
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                    <Link
                        href="/finance/quotations/create"
                        className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-amber-500/50 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    Create Quotation
                                </h3>
                                <p className="text-xs text-muted-foreground">Estimate & proposals</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <span>Prepare quote</span>
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                    <Link
                        href="/finance/invoices"
                        className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-border hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                                <Wallet className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Manage Invoices</h3>
                                <p className="text-xs text-muted-foreground">
                                    {stats.invoicesCount} total invoices
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            <span>View register</span>
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>

                    <Link
                        href="/finance/quotations"
                        className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-border hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                                <Layers3 className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Manage Quotations</h3>
                                <p className="text-xs text-muted-foreground">
                                    {stats.quotationsCount} active quotes
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            <span>View pipeline</span>
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                </div>

                {/* Charts & Analytics Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Financial Momentum Chart */}
                    <Card className="overflow-hidden border-border/70 shadow-sm lg:col-span-2">
                        <CardHeader className="pb-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TrendingUp className="size-5 text-primary" />
                                        Cashflow & Revenue Momentum
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                        Historical billing performance and cash realization velocity.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className={badgeToneClasses.success}>
                                    {collectionRate}% Realization Rate
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="h-[230px] w-full">
                                <svg
                                    viewBox="0 0 564 180"
                                    className="h-full w-full overflow-visible"
                                    role="img"
                                    aria-label="Financial momentum chart"
                                >
                                    <defs>
                                        <linearGradient
                                            id="financeMomentum"
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity=".28"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity="0"
                                            />
                                        </linearGradient>
                                    </defs>
                                    {[32, 73, 114, 154].map((y) => (
                                        <line
                                            key={y}
                                            x1="18"
                                            x2="546"
                                            y1={y}
                                            y2={y}
                                            className="stroke-border"
                                            strokeDasharray="3 5"
                                        />
                                    ))}
                                    <polygon
                                        points={chartAreaPoints}
                                        fill="url(#financeMomentum)"
                                    />
                                    <polyline
                                        points={chartPoints}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                    />
                                    {financialTrend.map((item, index) => {
                                        const x = index * 88 + 18;
                                        const y = 154 - item.value;

                                        return (
                                            <g key={item.month}>
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    fill="hsl(var(--card))"
                                                    r="5"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth="3"
                                                />
                                                <text
                                                    x={x}
                                                    y="176"
                                                    textAnchor="middle"
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                    {item.month}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collection Health Breakdown */}
                    <Card className="border-border/70 shadow-sm flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="size-5 text-primary" />
                                Collection Health
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Distribution of receivables and converted proposals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span>Collected Payments</span>
                                    <span className="font-mono text-green-600 dark:text-green-400">
                                        {collectionRate}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-green-500 transition-all duration-700"
                                        style={{ width: `${collectionRate}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span>Pending Receivables</span>
                                    <span className="font-mono text-amber-600 dark:text-amber-400">
                                        {outstandingRate}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-amber-500 transition-all duration-700"
                                        style={{ width: `${outstandingRate}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span>Quoted Pipeline Value</span>
                                    <span className="font-mono text-primary">
                                        ${stats.quotedAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-700"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                stats.invoicedAmount > 0
                                                    ? Math.round(
                                                          (stats.quotedAmount / stats.invoicedAmount) *
                                                              100,
                                                      )
                                                    : 50,
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 pt-3.5 space-y-1">
                                <p className="text-xs font-semibold">Operational Summary</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {stats.invoicesCount} active billing accounts with{' '}
                                    <span className="font-semibold text-foreground">
                                        ${stats.totalBalance.toLocaleString()}
                                    </span>{' '}
                                    awaiting settlement.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Financial Activity Snapshot */}
                <Card className="overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="size-5 text-primary" />
                                Recent Financial Activity
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs">
                                Latest issued invoices and quotations across properties.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                <Link href="/finance/invoices">
                                    All Invoices
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                <Link href="/finance/quotations">
                                    All Quotations
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-xs">
                                <thead className="border-y border-border/70 bg-secondary/35 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Document #</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Client / Tenant</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Balance Due</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {recentRecords.map((row) => {
                                        const isInvoice = row.type === 'invoice';
                                        const link = isInvoice
                                            ? `/finance/invoices/${row.id}`
                                            : `/finance/quotations/${row.id}`;
                                        const recipient =
                                            row.recipient_name ||
                                            (row.tenant
                                                ? `${row.tenant.first_name} ${row.tenant.last_name}`
                                                : '—');
                                        const balance = Number(row.balance);

                                        return (
                                            <tr
                                                key={row.id}
                                                className="transition-colors hover:bg-secondary/25"
                                            >
                                                <td className="px-6 py-3.5 font-semibold text-foreground">
                                                    <Link
                                                        href={link}
                                                        className={`hover:underline ${
                                                            isInvoice
                                                                ? 'text-primary'
                                                                : 'text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {row.invoice_number}
                                                    </Link>
                                                    <p className="text-[11px] font-normal text-muted-foreground truncate max-w-[180px]">
                                                        {row.title}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] uppercase font-semibold"
                                                    >
                                                        {isInvoice ? 'Invoice' : 'Quotation'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 font-medium">
                                                    {recipient}
                                                    {row.unit && (
                                                        <span className="block text-[11px] text-muted-foreground">
                                                            Unit {row.unit.unit_number}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusClass[row.status] ??
                                                            badgeToneClasses.neutral
                                                        }
                                                    >
                                                        {row.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 font-semibold tabular-nums">
                                                    {row.currency} {Number(row.amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3.5 font-medium tabular-nums">
                                                    <span
                                                        className={
                                                            balance > 0 && isInvoice
                                                                ? 'text-destructive font-semibold'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        {row.currency} {balance.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                    >
                                                        <Link href={link}>Open</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {recentRecords.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-8 text-center text-muted-foreground text-xs"
                                            >
                                                No financial records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FinanceIndex.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({
    breadcrumbs: [
        {
            title: 'Finance',
            href: '/finance',
        },
    ],
});
