import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CalendarDays,
    Clock3,
    Pencil,
    Plus,
    Search,
    Timer,
    UserRound,
    Users,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MaintenanceRow } from '@/components/maintenance/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Can } from '@/components/can';
import { create, edit, index, show } from '@/routes/maintenance';

type Props = {
    maintenances: MaintenanceRow[];
    stats: {
        totalRequests: number;
        openRequests: number;
        inProgress: number;
        urgentRequests: number;
    };
};

const statusMeta: Record<
    MaintenanceRow['status'],
    { label: string; bar: string; badge: string }
> = {
    open: {
        label: 'Open',
        bar: 'bg-amber-500',
        badge: badgeToneClasses.warning,
    },
    in_progress: {
        label: 'In progress',
        bar: 'bg-blue-500',
        badge: badgeToneClasses.info,
    },
    scheduled: {
        label: 'Scheduled',
        bar: 'bg-emerald-500',
        badge: badgeToneClasses.success,
    },
    completed: {
        label: 'Completed',
        bar: 'bg-green-600',
        badge: badgeToneClasses.success,
    },
    cancelled: {
        label: 'Cancelled',
        bar: 'bg-slate-400',
        badge: badgeToneClasses.neutral,
    },
};

const priorityMeta: Record<MaintenanceRow['priority'], string> = {
    low: badgeToneClasses.neutral,
    medium: badgeToneClasses.info,
    high: badgeToneClasses.warning,
    urgent: badgeToneClasses.danger,
};

function formatDate(value: string | null) {
    if (!value) return 'Unscheduled';

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function MaintenanceCard({ request }: { request: MaintenanceRow }) {
    const status = statusMeta[request.status];
    const tenantName = request.tenant
        ? `${request.tenant.first_name} ${request.tenant.last_name}`
        : 'No tenant linked';

    return (
        <article className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className={`h-1.5 w-full ${status.bar}`} />

            <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b pb-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                        <CalendarDays className="size-4 shrink-0 text-primary" />
                        <span className="truncate">
                            {formatDate(request.scheduled_date)}
                        </span>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold text-muted-foreground">
                        M{String(request.id).padStart(5, '0')}
                    </span>
                </div>

                <div className="space-y-3">
                    <div>
                        <Link
                            href={show(request.id)}
                            className="line-clamp-2 leading-snug font-semibold text-foreground transition-colors hover:text-primary"
                        >
                            {request.title}
                        </Link>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {request.category} · Maintenance request
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Building2 className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">
                                {request.property?.name || 'No property'}
                                {request.unit?.unit_number
                                    ? ` · Unit ${request.unit.unit_number}`
                                    : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserRound className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">{tenantName}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={status.badge}>
                            {status.label}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={priorityMeta[request.priority]}
                        >
                            {request.priority.charAt(0).toUpperCase() +
                                request.priority.slice(1)}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5 shrink-0" />
                            <span className="truncate">
                                {request.assigned_to || 'Unassigned'}
                            </span>
                        </div>

                        <Can permission="maintenance.manage">
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="size-8 shrink-0"
                            >
                                <Link
                                    href={edit(request.id)}
                                    aria-label={`Edit ${request.title}`}
                                >
                                    <Pencil className="size-3.5" />
                                </Link>
                            </Button>
                        </Can>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function MaintenanceIndex({ maintenances, stats }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredMaintenances = useMemo(() => {
        const query = search.trim().toLowerCase();

        return maintenances.filter((request) => {
            const matchesStatus =
                statusFilter === 'all' || request.status === statusFilter;
            const searchable = [
                request.title,
                request.category,
                request.property?.name,
                request.unit?.unit_number,
                request.tenant?.first_name,
                request.tenant?.last_name,
                request.assigned_to,
                `M${String(request.id).padStart(5, '0')}`,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return matchesStatus && (!query || searchable.includes(query));
        });
    }, [maintenances, search, statusFilter]);

    const sections: StatSection[] = [
        {
            title: 'Total requests',
            value: stats.totalRequests,
            description: 'All maintenance requests',
            icon: Wrench,
            color: 'primary',
        },
        {
            title: 'Open requests',
            value: stats.openRequests,
            description: 'Awaiting attention',
            icon: Timer,
            color: 'warning',
        },
        {
            title: 'In progress',
            value: stats.inProgress,
            description: 'Currently being worked on',
            icon: Users,
            color: 'info',
        },
        {
            title: 'Urgent requests',
            value: stats.urgentRequests,
            description: 'Requires immediate attention',
            icon: AlertCircle,
            color: 'destructive',
        },
    ];

    return (
        <>
            <Head title="Maintenance Management — SOMFIX" />

            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Maintenance management
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Track, triage, and manage property maintenance
                            requests.
                        </p>
                    </div>

                    <Can permission="maintenance.manage">
                        <Button asChild size="sm">
                            <Link href={create()}>
                                <Plus className="size-4" />
                                Add{' '}
                                <span className="hidden sm:inline">
                                    request
                                </span>
                            </Link>
                        </Button>
                    </Can>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in duration-1000 ease-in-out fade-in slide-in-from-bottom-6">
                    <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Maintenance schedule
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {filteredMaintenances.length} of{' '}
                                {maintenances.length} requests shown
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative sm:w-72">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search requests..."
                                    className="pl-9"
                                    aria-label="Search maintenance requests"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="sm:w-40">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    {Object.entries(statusMeta).map(
                                        ([value, meta]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {meta.label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filteredMaintenances.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {filteredMaintenances.map((request) => (
                                <MaintenanceCard
                                    key={request.id}
                                    request={request}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
                            <Wrench className="mx-auto mb-3 size-8 text-muted-foreground" />
                            <p className="font-medium">
                                No maintenance requests found
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try changing your search or status filter.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

MaintenanceIndex.layout = {
    breadcrumbs: [{ title: 'Maintenance', href: index() }],
};
