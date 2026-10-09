import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Calendar,
    ClipboardList,
    Eye,
    Pencil,
    Plus,
    RotateCcw,
    Users,
} from 'lucide-react';
import { StatsCard } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { stages, type Inquiry } from './types';
export { stages, type Inquiry } from './types';
type Filters = {
    search?: string;
    status?: string;
    archived?: boolean;
    per_page?: number;
};
export default function Requests({
    requests,
    filters,
    stats,
}: {
    requests: {
        data: Inquiry[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Filters;
    stats: { total: number; new: number; scheduled: number; converted: number };
}) {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const canManage = auth.permissions.includes('demo-requests.manage');
    const navigate = (changes: Record<string, unknown>) =>
        router.get(
            '/demo-requests',
            { ...filters, archived: filters.archived ? 1 : 0, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const columns: ColumnDef<Inquiry>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">
                    #{row.original.id}
                </span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Person / company',
            cell: ({ row }) => (
                <div>
                    <p className="font-semibold">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.company}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            cell: ({ row }) => (
                <a className="underline" href={`mailto:${row.original.email}`}>
                    {row.original.email}
                </a>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Stage',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={
                        row.original.status === 'converted'
                            ? badgeToneClasses.success
                            : row.original.status === 'scheduled'
                              ? badgeToneClasses.warning
                              : ''
                    }
                >
                    {stages[row.original.status]}
                </Badge>
            ),
        },
        {
            accessorKey: 'follow_up_at',
            header: 'Next follow-up',
            cell: ({ row }) =>
                row.original.follow_up_at
                    ? new Date(row.original.follow_up_at).toLocaleString()
                    : '—',
        },
        {
            accessorKey: 'created_at',
            header: 'Received',
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-1">
                    {filters.archived ? (
                        canManage && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    router.patch(
                                        `/demo-requests/${row.original.id}/restore`,
                                    )
                                }
                            >
                                <RotateCcw className="size-4" />
                                Restore
                            </Button>
                        )
                    ) : (
                        <>
                            <Button asChild size="icon" variant="ghost">
                                <Link
                                    aria-label={`View request from ${row.original.name}`}
                                    href={`/demo-requests/${row.original.id}`}
                                >
                                    <Eye className="size-4 text-[#FF8500]" />
                                </Link>
                            </Button>
                            {canManage && (
                                <Button asChild size="icon" variant="ghost">
                                    <Link
                                        aria-label={`Edit request from ${row.original.name}`}
                                        href={`/demo-requests/${row.original.id}/edit`}
                                    >
                                        <Pencil className="size-4 text-[#004317] dark:text-green-300" />
                                    </Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            ),
        },
    ];
    return (
        <>
            <Head title="Demo Requests — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Demo requests management
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage landing-page inquiries, walkthroughs and
                            tenant conversion.
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild size="sm">
                            <Link href="/demo-requests/create">
                                <Plus className="size-4" />
                                Add request
                            </Link>
                        </Button>
                    )}
                </div>
                <StatsCard
                    sections={[
                        {
                            title: 'Total requests',
                            value: stats.total,
                            description: 'Current inquiries',
                            icon: ClipboardList,
                            color: 'primary',
                        },
                        {
                            title: 'New inquiries',
                            value: stats.new,
                            description: 'Waiting for first contact',
                            icon: Plus,
                            color: 'info',
                        },
                        {
                            title: 'Scheduled walkthroughs',
                            value: stats.scheduled,
                            description: 'Appointments to complete',
                            icon: Calendar,
                            color: 'warning',
                        },
                        {
                            title: 'Linked tenants',
                            value: stats.converted,
                            description: 'Successful tenant conversions',
                            icon: Users,
                            color: 'success',
                        },
                    ]}
                />
                <div className="mt-6 animate-in duration-1000 ease-in-out fade-in slide-in-from-bottom-6">
                    <DataTable
                        title={
                            filters.archived
                                ? 'Deleted requests'
                                : 'Demo Requests'
                        }
                        searchTitle="Filter requests by name, email or company..."
                        columns={columns}
                        data={requests.data}
                        pagination={requests}
                        searchControl={{
                            value: filters.search ?? '',
                            onChange: (value) =>
                                navigate({ search: value, page: 1 }),
                        }}
                        onPageChange={(page) => navigate({ page })}
                        onPageSizeChange={(per_page) =>
                            navigate({ per_page, page: 1 })
                        }
                        filterControls={
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    aria-label="Request status"
                                    className="h-8 rounded-xs border bg-background px-2 text-xs"
                                    value={filters.status ?? ''}
                                    onChange={(e) =>
                                        navigate({
                                            status: e.target.value,
                                            page: 1,
                                        })
                                    }
                                >
                                    <option value="">All stages</option>
                                    {Object.entries(stages).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        navigate({
                                            archived: filters.archived ? 0 : 1,
                                            page: 1,
                                        })
                                    }
                                >
                                    {filters.archived
                                        ? 'Current requests'
                                        : 'Deleted requests'}
                                </Button>
                            </div>
                        }
                    />
                </div>
            </div>
        </>
    );
}
Requests.layout = {
    breadcrumbs: [{ title: 'Demo Requests', href: '/demo-requests' }],
};
