import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { Head, Link } from "@inertiajs/react";
import {
    ArrowUpRight,
    Building2,
    CalendarClock,
    ClipboardList,
    Layers3,
    Package,
    Plus,
    TrendingUp,
    Wallet,
    Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboard } from "@/routes";
import { index as propertiesIndex } from "@/routes/properties";
import { index as workOrdersIndex } from "@/routes/work-orders";

const metrics: StatSection[] = [
    {
        title: "Properties",
        value: "—",
        icon: Building2,
        color: "primary",
    },
    {
        title: "Open requests",
        value: "—",
        icon: Wrench,
        color: "warning",
    },
    {
        title: "Scheduled jobs",
        value: "—",
        icon: CalendarClock,
        color: "info",
    },
    {
        title: "Unpaid invoices",
        value: "—",
        icon: Wallet,
        color: "destructive",
    },
];

const launchTrend = [
    { label: "Foundation", value: 18 },
    { label: "Registry", value: 34 },
    { label: "Tenancy", value: 48 },
    { label: "Requests", value: 65 },
    { label: "Jobs", value: 79 },
    { label: "Finance", value: 92 },
    { label: "Live", value: 78 },
];

const moduleProgress = [
    { name: "Foundation", value: 100, color: "bg-primary" },
    { name: "Properties", value: 35, color: "bg-chart-4" },
    { name: "Maintenance", value: 18, color: "bg-accent" },
    { name: "Finance", value: 10, color: "bg-emerald-500" },
];

const deliveryRows = [
    {
        module: "Property & tenancy",
        focus: "Properties, units, tenants and lease records",
        team: "Operations",
        status: "Next",
        date: "Phase 2",
    },
    {
        module: "Maintenance workflow",
        focus: "Requests, triage, quotes and assignments",
        team: "Service team",
        status: "Planned",
        date: "Phase 3",
    },
    {
        module: "Finance & inventory",
        focus: "Invoices, payments, expenses and stock controls",
        team: "Finance",
        status: "Planned",
        date: "Phase 4",
    },
];

const chartPoints = launchTrend
    .map((item, index) => `${index * 88 + 18},${154 - item.value}`)
    .join(" ");
const chartAreaPoints = `18,154 ${chartPoints} 546,154`;

export default function Dashboard() {
    return (
        <>
            <Head title="Executive Dashboard — SOMFIX" />

            <div className="mx-auto w-full max-w-[1440px] p-4 md:p-6">
                <section className="flex flex-col gap-4 rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/80" />
                                <span className="relative inline-flex size-2 rounded-full bg-accent" />
                            </span>
                            SOMFIX PROPERTY OPERATIONS
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome to your operations dashboard
                        </h1>
                        <p className="text-sm text-white/80">
                            One clear place for property records, maintenance delivery, and
                            financial control.
                        </p>
                    </div>
                    <Button
                        asChild
                        size="sm"
                        className="shrink-0 bg-white font-bold text-primary shadow-sm hover:bg-white/90"
                    >
                        <Link href={workOrdersIndex()} prefetch>
                            <Plus className="size-4" />
                            Create work order
                        </Link>
                    </Button>
                </section>

                <StatsCard sections={metrics} />

                <div className="mt-6 space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-700">
                    <section className="grid gap-6 lg:grid-cols-3">
                        <Card className="overflow-hidden border-border/70 shadow-sm lg:col-span-2">
                            <CardHeader className="pb-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <TrendingUp className="size-5 text-primary" />
                                            SOMFIX delivery momentum
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-xs">
                                            A visual view of the connected operations roadmap.
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="border-primary/20 bg-primary/10 text-primary"
                                    >
                                        Foundation ready
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="h-[230px] w-full">
                                    <svg
                                        viewBox="0 0 564 180"
                                        className="h-full w-full overflow-visible"
                                        role="img"
                                        aria-label="SOMFIX delivery momentum chart"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="somfixMomentum"
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
                                            fill="url(#somfixMomentum)"
                                        />
                                        <polyline
                                            points={chartPoints}
                                            fill="none"
                                            stroke="hsl(var(--primary))"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                        />
                                        {launchTrend.map((item, index) => {
                                            const x = index * 88 + 18;
                                            const y = 154 - item.value;

                                            return (
                                                <g key={item.label}>
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
                                                        {item.label}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="size-5 text-primary" />
                                    Workspace coverage
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Delivery investment by operations area.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {moduleProgress.map((module) => (
                                    <div key={module.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span>{module.name}</span>
                                            <span className="font-mono text-muted-foreground">
                                                {module.value}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${module.color}`}
                                                style={{ width: `${module.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    <Card className="border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Layers3 className="size-5 text-primary" />
                                Module delivery progress
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Delivery maturity across the core SOMFIX workspaces.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid min-h-[170px] grid-cols-4 items-end gap-4 border-b border-border/70 pt-4">
                                {moduleProgress.map((module) => (
                                    <div
                                        key={module.name}
                                        className="flex min-w-0 flex-col items-center gap-2"
                                    >
                                        <span className="text-xs font-bold text-foreground">
                                            {module.value}%
                                        </span>
                                        <div className="flex h-28 w-full max-w-24 items-end rounded-t-lg bg-secondary/60 px-2">
                                            <div
                                                className={`w-full rounded-t-md ${module.color}`}
                                                style={{ height: `${module.value}%` }}
                                            />
                                        </div>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {module.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 shadow-sm">
                        <CardHeader className="flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ClipboardList className="size-5 text-primary" />
                                    Operations delivery roster
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    The next modules that will complete the end-to-end property
                                    workflow.
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                <Link href={propertiesIndex()} prefetch>
                                    Open workspace
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-xs">
                                    <thead className="border-y border-border/70 bg-secondary/35 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Module</th>
                                            <th className="px-6 py-3">Focus</th>
                                            <th className="px-6 py-3">Team</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Target</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/70">
                                        {deliveryRows.map((row) => (
                                            <tr
                                                key={row.module}
                                                className="transition-colors hover:bg-secondary/25"
                                            >
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    {row.module}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {row.focus}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {row.team}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            row.status === "Next"
                                                                ? "border-accent/30 bg-accent/15 text-amber-800 dark:text-accent"
                                                                : "border-border bg-muted text-muted-foreground"
                                                        }
                                                    >
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                                                    {row.date}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: "Dashboard", href: dashboard() }],
};
