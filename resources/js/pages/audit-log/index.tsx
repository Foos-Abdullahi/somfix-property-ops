import { useAccessFilters } from '@/hooks/use-access-filters';
import { FilterSelect } from '@/components/tools/table/filter-select';
import { DatePicker } from '@/components/ui/date-picker';
import { ClipboardList, Calendar, Pencil, LogIn, Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { Link, usePage } from '@inertiajs/react';
import {
    AccessPage,
    Errors,
    Pagination,
    type Paginated,
} from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Log = {
    id: number;
    actor_name: string;
    action: string;
    subject_type: string;
    subject_id: number;
    record_name: string;
    created_at: string;
    changes: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
        password_changed: boolean;
    } | null;
};
export default function AuditLog({
    logs,
    stats,
    filters,
}: {
    logs: Paginated<Log>;
    stats: { total: number; today: number; changes: number; signIns: number };
    filters: { search?: string; action?: string; from?: string; to?: string };
}) {
    const { values, update } = useAccessFilters('/settings/audit-log', {
        search: filters.search ?? '',
        action: filters.action ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
    });
    const { errors } = usePage().props;
    const columns: ColumnDef<Log>[] = [
        {
            id: 'time',
            accessorKey: 'created_at',
            header: 'Time',
            cell: ({ row }) => {
                const log = row.original;
                return <>{new Date(log.created_at).toLocaleString()}</>;
            },
        },
        {
            id: 'actor',
            accessorKey: 'actor_name',
            header: 'Actor',
            cell: ({ row }) => {
                const log = row.original;
                return <>{log.actor_name}</>;
            },
        },
        {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <>
                        <Badge
                            variant={
                                log.action === 'deleted'
                                    ? 'danger'
                                    : log.action === 'logout'
                                      ? 'neutral'
                                      : log.action === 'created' ? 'success' : 'info'
                            }
                            className="capitalize"
                        >
                            {log.action}
                        </Badge>
                    </>
                );
            },
        },
        {
            id: 'record',
            accessorKey: 'record_name',
            header: 'Record',
            cell: ({ row }) => {
                const log = row.original;
                return <>{log.record_name}</>;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <Button asChild variant="ghost" size="icon">
                        <Link
                            href={`/settings/audit-log/${log.id}`}
                            aria-label={`View changes to ${log.record_name}`}
                        >
                            <Eye className="size-4 text-[#FF8500]" />
                        </Link>
                    </Button>
                );
            },
        },
    ];
    return (
        <AccessPage
            title="Audit log"
            stats={[
                {
                    title: 'Total events',
                    value: stats.total,
                    icon: ClipboardList,
                    color: 'primary',
                },
                {
                    title: 'Today',
                    value: stats.today,
                    icon: Calendar,
                    color: 'info',
                },
                {
                    title: 'Record changes',
                    value: stats.changes,
                    icon: Pencil,
                    color: 'warning',
                },
                {
                    title: 'Sign-ins',
                    value: stats.signIns,
                    icon: LogIn,
                    color: 'success',
                },
            ]}
            description="Read-only history of account activity and record changes, recorded from the time audit logging was enabled."
        >
            <Errors errors={errors} />
            <DataTable
                title="Activity"
                searchTitle="Filter activity by actor, record type or ID..."
                columns={columns}
                data={logs.data}
                searchControl={{
                    value: values.search,
                    onChange: (search) => update({ ...values, search }, 300),
                }}
                filterControls={
                    <>
                        <FilterSelect
                            label="All actions"
                            value={values.action}
                            options={[
                                'created',
                                'updated',
                                'deleted',
                                'login',
                                'logout',
                            ].map((action) => ({
                                value: action,
                                label:
                                    action.charAt(0).toUpperCase() +
                                    action.slice(1),
                            }))}
                            onChange={(action) => update({ ...values, action })}
                        />
                        <DatePicker
                            label="From date"
                            value={values.from}
                            max={values.to || undefined}
                            onChange={(from) => update({ ...values, from })}
                        />
                        <DatePicker
                            label="To date"
                            value={values.to}
                            min={values.from || undefined}
                            onChange={(to) => update({ ...values, to })}
                        />
                        {Object.values(values).some(Boolean) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    update({
                                        search: '',
                                        action: '',
                                        from: '',
                                        to: '',
                                    })
                                }
                            >
                                Reset
                            </Button>
                        )}
                    </>
                }
                hidePagination
            />
            <Pagination page={logs} />
        </AccessPage>
    );
}
AuditLog.layout = {
    breadcrumbs: [{ title: 'Audit Log', href: '/settings/audit-log' }],
};
