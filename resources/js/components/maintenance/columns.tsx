import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Edit, Eye, MapPin } from 'lucide-react';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { edit, show } from '@/routes/maintenance';

export type MaintenanceRow = {
    id: number;
    property_id: number;
    unit_id: number | null;
    tenant_id: number | null;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
    assigned_to: string | null;
    scheduled_date: string | null;
    completed_date: string | null;
    estimated_cost: number | null;
    actual_cost: number | null;
    property?: {
        id: number;
        name: string;
    };
    unit?: {
        id: number;
        unit_number: string;
    };
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
    };
};

export const maintenanceColumns: ColumnDef<MaintenanceRow>[] = [
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
        accessorKey: 'title',
        header: 'Request',
        cell: ({ row }) => (
            <div>
                <p className="font-semibold">{row.original.title}</p>
                <p className="text-xs text-muted-foreground">
                    {row.original.category}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'property',
        header: 'Location',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <div>
                    <p className="font-semibold">
                        {row.original.property?.name || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.unit?.unit_number || '—'}
                    </p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
            const priorityColors = {
                low: badgeToneClasses.neutral,
                medium: badgeToneClasses.info,
                high: badgeToneClasses.warning,
                urgent: badgeToneClasses.danger,
            };
            return (
                <Badge
                    variant="outline"
                    className={priorityColors[row.original.priority] || ''}
                >
                    {row.original.priority.charAt(0).toUpperCase() +
                        row.original.priority.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const statusColors = {
                open: badgeToneClasses.warning,
                in_progress: badgeToneClasses.info,
                scheduled: badgeToneClasses.success,
                completed: badgeToneClasses.success,
                cancelled: badgeToneClasses.neutral,
            };
            const statusLabels = {
                open: 'Open',
                in_progress: 'In Progress',
                scheduled: 'Scheduled',
                completed: 'Completed',
                cancelled: 'Cancelled',
            };
            return (
                <Badge
                    variant="outline"
                    className={statusColors[row.original.status] || ''}
                >
                    {statusLabels[row.original.status] || row.original.status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'assigned_to',
        header: 'Assigned To',
        cell: ({ row }) => row.original.assigned_to ?? '—',
    },
    {
        accessorKey: 'scheduled_date',
        header: 'Scheduled',
        cell: ({ row }) =>
            row.original.scheduled_date ? (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    {new Date(row.original.scheduled_date).toLocaleDateString()}
                </div>
            ) : (
                '—'
            ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-1">
                <Button asChild size="icon" variant="ghost">
                    <Link href={show(row.original.id)}>
                        <Eye className="size-4 text-[#FF8500]" />
                    </Link>
                </Button>
                <Button asChild size="icon" variant="ghost">
                    <Link href={edit(row.original.id)}>
                        <Edit className="size-4 text-[#004317] dark:text-green-300" />
                    </Link>
                </Button>
            </div>
        ),
    },
];
