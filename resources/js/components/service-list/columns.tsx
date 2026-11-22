import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';
import { Can } from '@/components/can';
import { money } from '@/components/detail-page';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { edit, show } from '@/routes/service-list';

export type ServiceRow = {
    id: number;
    name: string;
    category: string;
    description: string | null;
    unit: string | null;
    price: string | null;
    duration: string | null;
    status: 'active' | 'inactive';
    images?: string[] | null;
};

export const serviceColumns: ColumnDef<ServiceRow>[] = [
    {
        accessorKey: 'name',
        header: 'Service',
        cell: ({ row }) => (
            <div className="flex max-w-xs items-center gap-3">
                {row.original.images?.[0] ? (
                    <img
                        src={row.original.images[0]}
                        alt=""
                        className="size-10 shrink-0 rounded-lg border border-border/70 object-cover"
                    />
                ) : (
                    <div className="size-10 shrink-0 rounded-lg border border-dashed border-border/70 bg-secondary/30" />
                )}
                <div className="min-w-0">
                    <p className="font-semibold">{row.original.name}</p>
                    {row.original.description && (
                        <p className="truncate text-xs text-muted-foreground">
                            {row.original.description}
                        </p>
                    )}
                </div>
            </div>
        ),
    },
    { accessorKey: 'category', header: 'Category' },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) =>
            row.original.price === null
                ? '—'
                : money(row.original.price) +
                  (row.original.unit ? ` / ${row.original.unit}` : ''),
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => row.original.duration ?? '—',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={
                    row.original.status === 'active'
                        ? badgeToneClasses.success
                        : badgeToneClasses.danger
                }
            >
                {row.original.status.toUpperCase()}
            </Badge>
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
                <Can permission="service-list.manage">
                    <Button asChild size="icon" variant="ghost">
                        <Link href={edit(row.original.id)}>
                            <Edit className="size-4 text-[#004317] dark:text-green-300" />
                        </Link>
                    </Button>
                </Can>
            </div>
        ),
    },
];
