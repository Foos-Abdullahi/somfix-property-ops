import { ClipboardList, Calendar, Pencil, LogIn } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    AccessPage,
    Errors,
    Pagination,
    selectClass,
    type Paginated,
} from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Log = {
    id: number;
    actor_name: string;
    action: string;
    subject_type: string;
    subject_id: number;
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
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const { errors } = usePage().props;
    const columns: ColumnDef<Log>[] = [
        {
            id: 'column0',
            header: 'Time',
            cell: ({ row }) => {
                const log = row.original;
                return <>{new Date(log.created_at).toLocaleString()}</>;
            },
        },
        {
            id: 'column1',
            header: 'Actor',
            cell: ({ row }) => {
                const log = row.original;
                return <>{log.actor_name}</>;
            },
        },
        {
            id: 'column2',
            header: 'Action',
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <>
                        <Badge variant="secondary">{log.action}</Badge>
                    </>
                );
            },
        },
        {
            id: 'column3',
            header: 'Record',
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <>
                        {log.subject_type} #{log.subject_id}
                    </>
                );
            },
        },
        {
            id: 'column4',
            header: 'Changes',
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/settings/audit-log/${log.id}`}>
                            View changes
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
            <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(
                        '/settings/audit-log',
                        { search, action, from, to },
                        { preserveState: true },
                    );
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="audit-search">
                        Actor, record type, or ID
                    </Label>
                    <Input
                        id="audit-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audit-action">Action</Label>
                    <select
                        id="audit-action"
                        className={`${selectClass} block`}
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                    >
                        <option value="">All actions</option>
                        {[
                            'created',
                            'updated',
                            'deleted',
                            'login',
                            'logout',
                        ].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audit-from">From</Label>
                    <Input
                        id="audit-from"
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audit-to">To</Label>
                    <Input
                        id="audit-to"
                        type="date"
                        min={from || undefined}
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filter</Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        setSearch('');
                        setAction('');
                        setFrom('');
                        setTo('');
                        router.get('/settings/audit-log');
                    }}
                >
                    Clear
                </Button>
            </form>
            <DataTable
                title="Activity"
                searchTitle="Search..."
                columns={columns}
                data={logs.data}
                searchable={false}
                hidePagination
            />
            <Pagination page={logs} />
        </AccessPage>
    );
}
AuditLog.layout = {
    breadcrumbs: [{ title: 'Audit Log', href: '/settings/audit-log' }],
};
