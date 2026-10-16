import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Plus,
    Target,
    TrendingUp,
    UserRoundPlus,
    Users,
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

type SalesStats = {
    newLeads: number;
    quoteValue: number;
    jobsInProgress: number;
    outstandingBalance: number;
    collectedThisMonth: number;
    totalCustomers: number;
    leadConversionRate: number;
    jobCompletionRate: number;
    collectionRate: number;
};

type TrendPoint = { month: string; leads: number; jobs: number };
type CustomerSummary = { id: number; name: string } | null;
type RecentJob = {
    id: number;
    job_number: string;
    title: string;
    status: string;
    approved_value: string | number;
    created_at: string;
    customer: CustomerSummary;
};
type RecentLead = {
    id: number;
    title: string;
    status: string;
    estimated_value: string | number | null;
    created_at: string;
    customer: CustomerSummary;
};
type ActivityRow = {
    id: string;
    type: 'Lead' | 'Job';
    reference: string;
    title: string;
    customer: string;
    status: string;
    value: number;
    createdAt: string;
    href: string;
};

const statusClass: Record<string, string> = {
    new: badgeToneClasses.info,
    contacted: badgeToneClasses.info,
    inspection_scheduled: badgeToneClasses.warning,
    quoted: badgeToneClasses.warning,
    converted: badgeToneClasses.success,
    lost: badgeToneClasses.danger,
    approved: badgeToneClasses.info,
    scheduled: badgeToneClasses.warning,
    in_progress: badgeToneClasses.warning,
    awaiting_verification: badgeToneClasses.info,
    completed: badgeToneClasses.success,
    closed: badgeToneClasses.success,
    cancelled: badgeToneClasses.danger,
};

const money = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const label = (value: string) =>
    value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());

export default function SalesIndex({
    stats,
    monthlyTrend,
    recentJobs,
    recentLeads,
}: {
    stats: SalesStats;
    monthlyTrend: TrendPoint[];
    recentJobs: RecentJob[];
    recentLeads: RecentLead[];
}) {
    const metrics: StatSection[] = [
        {
            title: 'Open Leads',
            value: stats.newLeads,
            description: `${stats.leadConversionRate}% conversion rate`,
            icon: Target,
            color: 'info',
        },
        {
            title: 'Quoted Pipeline',
            value: money(stats.quoteValue),
            description: 'Active sales opportunity value',
            icon: CircleDollarSign,
            color: 'accent',
        },
        {
            title: 'Active Jobs',
            value: stats.jobsInProgress,
            description: `${stats.jobCompletionRate}% completion rate`,
            icon: BriefcaseBusiness,
            color: 'warning',
        },
        {
            title: 'Collected This Month',
            value: money(stats.collectedThisMonth),
            description: `${stats.collectionRate}% invoice realization`,
            icon: Wallet,
            color: 'success',
        },
    ];

    const chartBottom = 154;
    const chartTop = 24;
    const maxActivity = Math.max(
        1,
        ...monthlyTrend.flatMap((point) => [point.leads, point.jobs]),
    );
    const xStep = monthlyTrend.length > 1 ? 528 / (monthlyTrend.length - 1) : 0;
    const chartPoint = (value: number, index: number) => ({
        x: index * xStep + 18,
        y: chartBottom - (value / maxActivity) * (chartBottom - chartTop),
    });
    const leadPoints = monthlyTrend
        .map((point, index) => {
            const coordinates = chartPoint(point.leads, index);
            return `${coordinates.x},${coordinates.y}`;
        })
        .join(' ');
    const jobPoints = monthlyTrend
        .map((point, index) => {
            const coordinates = chartPoint(point.jobs, index);
            return `${coordinates.x},${coordinates.y}`;
        })
        .join(' ');
    const leadArea = `18,${chartBottom} ${leadPoints} 546,${chartBottom}`;

    const recentActivity: ActivityRow[] = [
        ...recentJobs.map((job) => ({
            id: `job-${job.id}`,
            type: 'Job' as const,
            reference: job.job_number,
            title: job.title,
            customer: job.customer?.name ?? 'No customer assigned',
            status: job.status,
            value: Number(job.approved_value ?? 0),
            createdAt: job.created_at,
            href: `/sales/jobs/${job.id}`,
        })),
        ...recentLeads.map((lead) => ({
            id: `lead-${lead.id}`,
            type: 'Lead' as const,
            reference: `LEAD-${String(lead.id).padStart(4, '0')}`,
            title: lead.title,
            customer: lead.customer?.name ?? 'Unassigned customer',
            status: lead.status,
            value: Number(lead.estimated_value ?? 0),
            createdAt: lead.created_at,
            href: `/sales/leads/${lead.id}`,
        })),
    ]
        .sort(
            (first, second) =>
                Date.parse(second.createdAt) - Date.parse(first.createdAt),
        )
        .slice(0, 8);

    return (
        <>
            <Head title="Sales & Jobs — SOMFIX" />
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Sales & Jobs
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Track demand, convert opportunities, deliver service
                            work, and collect revenue.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/sales/leads/create">
                                <Plus className="size-4 text-sky-600" />
                                New Lead
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/sales/jobs/create">
                                <Plus className="size-4" />
                                New Job
                            </Link>
                        </Button>
                    </div>
                </div>

                <StatsCard sections={metrics} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickAction
                        href="/sales/leads/create"
                        icon={UserRoundPlus}
                        title="Capture Lead"
                        description="Register a new request"
                        action="Start opportunity"
                        tone="info"
                    />
                    <QuickAction
                        href="/sales/jobs/create"
                        icon={BriefcaseBusiness}
                        title="Create Job"
                        description="Schedule approved work"
                        action="Open work file"
                        tone="primary"
                    />
                    <QuickAction
                        href="/sales/customers"
                        icon={Users}
                        title="Manage Customers"
                        description={`${stats.totalCustomers} active customers`}
                        action="View directory"
                    />
                    <QuickAction
                        href="/sales/jobs"
                        icon={CheckCircle2}
                        title="Manage Jobs"
                        description={`${stats.jobsInProgress} jobs need attention`}
                        action="View job board"
                    />
                </div>

                <div className="grid gap-6 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-4 lg:grid-cols-3">
                    <Card className="overflow-hidden border-border/70 shadow-sm lg:col-span-2">
                        <CardHeader className="pb-0">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <TrendingUp className="size-5 text-primary" />
                                        Sales-to-Job Momentum
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                        New leads and jobs opened across the
                                        last six months.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-primary" />
                                        Leads
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-amber-500" />
                                        Jobs
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="h-[230px] w-full">
                                <svg
                                    viewBox="0 0 564 180"
                                    className="h-full w-full overflow-visible"
                                    role="img"
                                    aria-label="Sales leads and jobs trend"
                                >
                                    <defs>
                                        <linearGradient
                                            id="salesMomentum"
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity=".24"
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
                                        points={leadArea}
                                        fill="url(#salesMomentum)"
                                    />
                                    <polyline
                                        points={leadPoints}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                    />
                                    <polyline
                                        points={jobPoints}
                                        fill="none"
                                        stroke="rgb(245 158 11)"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                    />
                                    {monthlyTrend.map((point, index) => {
                                        const lead = chartPoint(
                                            point.leads,
                                            index,
                                        );
                                        const job = chartPoint(
                                            point.jobs,
                                            index,
                                        );
                                        return (
                                            <g key={`${point.month}-${index}`}>
                                                <circle
                                                    cx={lead.x}
                                                    cy={lead.y}
                                                    r="4.5"
                                                    fill="hsl(var(--card))"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth="3"
                                                />
                                                <circle
                                                    cx={job.x}
                                                    cy={job.y}
                                                    r="4.5"
                                                    fill="hsl(var(--card))"
                                                    stroke="rgb(245 158 11)"
                                                    strokeWidth="3"
                                                />
                                                <text
                                                    x={lead.x}
                                                    y="176"
                                                    textAnchor="middle"
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                    {point.month}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-between border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="size-5 text-primary" />
                                Pipeline Health
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Conversion, delivery, and collection
                                performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ProgressMetric
                                label="Lead Conversion"
                                value={stats.leadConversionRate}
                                tone="primary"
                            />
                            <ProgressMetric
                                label="Job Completion"
                                value={stats.jobCompletionRate}
                                tone="success"
                            />
                            <ProgressMetric
                                label="Invoice Collection"
                                value={stats.collectionRate}
                                tone="warning"
                            />
                            <div className="space-y-1 rounded-xl border border-border/60 bg-muted/30 p-3 pt-3.5">
                                <p className="text-xs font-semibold">
                                    Revenue Follow-up
                                </p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {money(stats.outstandingBalance)}
                                    </span>{' '}
                                    remains open across customer invoices.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-border/70 shadow-sm motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock3 className="size-5 text-primary" />
                                Recent Sales & Job Activity
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs">
                                Latest opportunities and service jobs across the
                                operating pipeline.
                            </CardDescription>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs"
                            >
                                <Link href="/sales/leads">
                                    All Leads{' '}
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs"
                            >
                                <Link href="/sales/jobs">
                                    All Jobs{' '}
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-xs">
                                <thead className="border-y border-border/70 bg-secondary/35 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Reference</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Value</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {recentActivity.length ? (
                                        recentActivity.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="transition-colors hover:bg-secondary/25"
                                            >
                                                <td className="px-6 py-3.5 font-semibold">
                                                    <Link
                                                        href={row.href}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {row.reference}
                                                    </Link>
                                                    <p className="max-w-[220px] truncate text-[11px] font-normal text-muted-foreground">
                                                        {row.title}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] font-semibold uppercase"
                                                    >
                                                        {row.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 font-medium">
                                                    {row.customer}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusClass[
                                                                row.status
                                                            ] ??
                                                            badgeToneClasses.neutral
                                                        }
                                                    >
                                                        {label(row.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3.5 font-mono font-semibold">
                                                    {money(row.value)}
                                                </td>
                                                <td className="px-6 py-3.5 text-muted-foreground">
                                                    {new Date(
                                                        row.createdAt,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 gap-1 px-2 text-[11px]"
                                                    >
                                                        <Link href={row.href}>
                                                            Open{' '}
                                                            <ArrowRight className="size-3" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-10 text-center text-muted-foreground"
                                            >
                                                No sales or job activity yet.
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

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    action,
    tone = 'neutral',
}: {
    href: string;
    icon: typeof Users;
    title: string;
    description: string;
    action: string;
    tone?: 'primary' | 'info' | 'neutral';
}) {
    const iconTone =
        tone === 'primary'
            ? 'bg-primary/10 text-primary'
            : tone === 'info'
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
              : 'bg-secondary text-foreground';
    return (
        <Link
            href={href}
            className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${iconTone}`}
                >
                    <Icon className="size-5" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold transition-colors group-hover:text-primary">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                <span>{action}</span>
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function ProgressMetric({
    label: metricLabel,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'primary' | 'success' | 'warning';
}) {
    const toneClass =
        tone === 'success'
            ? 'bg-emerald-500'
            : tone === 'warning'
              ? 'bg-amber-500'
              : 'bg-primary';
    const textClass =
        tone === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-primary';
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
                <span>{metricLabel}</span>
                <span className={`font-mono ${textClass}`}>{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${toneClass}`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}

SalesIndex.layout = {
    breadcrumbs: [{ title: 'Sales & Jobs', href: '/sales' }],
};
