import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Edit, Eye, MapPin, Users } from 'lucide-react';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { edit, show } from '@/routes/leases';

export type LeaseRow = {
    id: number;
    tenant_id: number;
    unit_id: number;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
    status: 'active' | 'expired' | 'pending' | 'terminated';
    payment_due_day: number;
    currency: string;
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    unit?: {
        id: number;
        unit_number: string;
        property?: {
            id: number;
            name: string;
        };
    };
};

export const leaseColumns: ColumnDef<LeaseRow>[] = [
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
        accessorKey: 'tenant',
        header: 'Tenant',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <div>
                    <p className="font-semibold">
                        {row.original.tenant
                            ? `${row.original.tenant.first_name} ${row.original.tenant.last_name}`
                            : '—'}
                    </p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <div>
                    <p className="font-semibold">
                        {row.original.unit?.unit_number || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.unit?.property?.name || '—'}
                    </p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'period',
        header: 'Lease Period',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>
                    {new Date(row.original.start_date).toLocaleDateString()} —{' '}
                    {new Date(row.original.end_date).toLocaleDateString()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'monthly_rent',
        header: 'Monthly Rent',
        cell: ({ row }) => (
            <span className="font-mono font-semibold">
                {row.original.currency}{' '}
                {Number(row.original.monthly_rent).toFixed(2)}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const statusColors = {
                active: badgeToneClasses.success,
                expired: badgeToneClasses.danger,
                pending: badgeToneClasses.warning,
                terminated: badgeToneClasses.neutral,
            };
            return (
                <Badge
                    variant="outline"
                    className={statusColors[row.original.status] || ''}
                >
                    {row.original.status.charAt(0).toUpperCase() +
                        row.original.status.slice(1)}
                </Badge>
            );
        },
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
