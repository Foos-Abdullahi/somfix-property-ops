import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    ClipboardList,
    FileText,
    Wallet,
    Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as financeIndex } from '@/routes/finance';
import { index as maintenanceIndex } from '@/routes/maintenance';
import { index as propertiesIndex } from '@/routes/properties';
import { index as workOrdersIndex } from '@/routes/work-orders';
import type { NavItem } from '@/types';

const overviewMetrics = [
    {
        title: 'Properties',
        value: '—',
        detail: 'Registry not connected',
        icon: Building2,
    },
    {
        title: 'Open requests',
        value: '—',
        detail: 'Maintenance not connected',
        icon: Wrench,
    },
    {
        title: 'Scheduled jobs',
        value: '—',
        detail: 'Field service not connected',
        icon: ClipboardList,
    },
    {
        title: 'Unpaid invoices',
        value: '—',
        detail: 'Finance not connected',
        icon: FileText,
    },
];

const workflowSteps = [
    {
        title: 'Report',
        description: 'A tenant or staff member reports a property issue.',
    },
    {
        title: 'Triage',
        description: 'The team confirms urgency, scope, and next action.',
    },
    {
        title: 'Quote',
        description: 'An estimate is prepared and approved when needed.',
    },
    {
        title: 'Schedule',
        description: 'A qualified technician is assigned to the work.',
    },
    {
        title: 'Complete',
        description: 'Materials, evidence, and inspection are recorded.',
    },
    {
        title: 'Invoice',
        description: 'Payment is collected and history is retained.',
    },
];

const readinessItems = [
    {
        title: 'Application foundation',
        description: 'Authentication, layouts, brand tokens, and navigation.',
        status: 'Ready',
        ready: true,
    },
    {
        title: 'Property and tenancy',
        description: 'Properties, units, tenants, leases, and documents.',
        status: 'Next',
        ready: false,
    },
    {
        title: 'Maintenance workflow',
        description: 'Requests, triage, quotes, scheduling, and job orders.',
        status: 'Planned',
        ready: false,
    },
    {
        title: 'Business operations',
        description: 'Inventory, invoicing, payments, reports, and exports.',
        status: 'Planned',
        ready: false,
    },
];

const quickLinks: NavItem[] = [
    {
        title: 'Properties',
        href: propertiesIndex(),
        icon: Building2,
    },
    {
        title: 'Maintenance',
        href: maintenanceIndex(),
        icon: Wrench,
    },
    {
        title: 'Work Orders',
        href: workOrdersIndex(),
        icon: ClipboardList,
    },
    {
        title: 'Finance',
        href: financeIndex(),
        icon: Wallet,
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Operations Dashboard" />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge className="gap-1.5">
                                <Check className="size-3.5" />
                                Foundation ready
                            </Badge>
                            <Badge variant="outline">
                                Mogadishu operations
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Operations overview
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                            A clear starting point for property records,
                            maintenance execution, and the financial history
                            that connects them.
                        </p>
                    </div>

                    <Button asChild className="w-fit">
                        <Link href={propertiesIndex()} prefetch>
                            <Building2 />
                            Open property workspace
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {overviewMetrics.map((metric) => (
                        <Card key={metric.title} className="gap-4">
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {metric.title}
                                </CardTitle>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <metric.icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold tracking-tight">
                                    {metric.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {metric.detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.7fr)]">
                    <Card>
                        <CardHeader>
                            <Badge variant="outline" className="w-fit">
                                Core workflow
                            </Badge>
                            <CardTitle className="text-xl">
                                One connected repair lifecycle
                            </CardTitle>
                            <CardDescription>
                                Every request follows a traceable path from
                                tenant report to payment and retained history.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {workflowSteps.map((step, index) => (
                                    <li
                                        key={step.title}
                                        className="rounded-xl border bg-background p-4"
                                    >
                                        <div className="mb-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                            {index + 1}
                                        </div>
                                        <p className="font-semibold">
                                            {step.title}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Startup progress</CardTitle>
                            <CardDescription>
                                The application shell is prepared in delivery
                                order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="flex flex-col gap-4">
                                {readinessItems.map((item) => (
                                    <li
                                        key={item.title}
                                        className="flex gap-3 border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div
                                            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${item.ready ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {item.ready ? (
                                                <Check className="size-3.5" />
                                            ) : (
                                                <span className="size-1.5 rounded-full bg-current" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold">
                                                    {item.title}
                                                </p>
                                                <Badge
                                                    variant={
                                                        item.ready
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle>Open a workspace</CardTitle>
                            <CardDescription>
                                Start with the operational area you need next.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {quickLinks.map((item) => (
                            <Button
                                key={item.title}
                                variant="outline"
                                className="h-auto justify-between"
                                asChild
                            >
                                <Link href={item.href} prefetch>
                                    <span className="flex items-center gap-2">
                                        {item.icon && <item.icon />}
                                        {item.title}
                                    </span>
                                    <ArrowRight />
                                </Link>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
