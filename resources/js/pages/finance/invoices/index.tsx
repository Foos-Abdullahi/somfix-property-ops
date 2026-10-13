import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Edit,
    Eye,
    Plus,
    Printer,
    Receipt,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

export type InvoiceRow = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: string;
    currency: string;
    amount: string;
    paid_amount: string;
    balance: string;
    status: string;
    due_date: string | null;
    paid_date: string | null;
    created_at: string;
    property: { id: number; name: string } | null;
    unit: { id: number; unit_number: string } | null;
    tenant: { id: number; first_name: string; last_name: string } | null;
    recipient_name: string | null;
};

const statusClass: Record<string, string> = {
    draft: badgeToneClasses.neutral,
    sent: badgeToneClasses.info,
    paid: badgeToneClasses.success,
    overdue: badgeToneClasses.danger,
    cancelled: badgeToneClasses.neutral,
};

export default function InvoicesIndex({
    invoices,
    stats,
}: {
    invoices: InvoiceRow[];
    stats: {
        totalInvoices: number;
        totalAmount: number;
        totalPaid: number;
        totalBalance: number;
        overdueCount: number;
        paidCount: number;
    };
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (invoice: InvoiceRow) => {
        setInvoiceToDelete(invoice);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!invoiceToDelete || isDeleting) return;

        router.delete(`/finance/invoices/${invoiceToDelete.id}`, {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                toast.success('Invoice deleted successfully');
                setDeleteDialogOpen(false);
                setInvoiceToDelete(null);
            },
            onError: () => {
                toast.error('Could not delete invoice');
                setIsDeleting(false);
            },
        });
    };

    const columns = useMemo<ColumnDef<InvoiceRow>[]>(
        () => [
            {
                accessorKey: 'invoice_number',
                header: 'Invoice #',
                cell: ({ row }) => (
                    <div>
                        <Link
                            href={`/finance/invoices/${row.original.id}`}
                            className="font-semibold text-primary hover:underline"
                        >
                            {row.original.invoice_number}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {row.original.title}
                        </p>
                    </div>
                ),
            },
            {
                id: 'recipient',
                header: 'Tenant / Client',
                cell: ({ row }) => {
                    const tenant = row.original.tenant;
                    const recipient =
                        row.original.recipient_name ||
                        (tenant ? `${tenant.first_name} ${tenant.last_name}` : '—');
                    const unit = row.original.unit?.unit_number;
                    const property = row.original.property?.name;

                    return (
                        <div>
                            <p className="font-medium text-sm">{recipient}</p>
                            {(unit || property) && (
                                <p className="text-xs text-muted-foreground">
                                    {[unit ? `Unit ${unit}` : null, property]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'amount',
                header: 'Total',
                cell: ({ row }) => (
                    <span className="font-semibold tabular-nums">
                        {row.original.currency} {Number(row.original.amount).toFixed(2)}
                    </span>
                ),
            },
            {
                accessorKey: 'paid_amount',
                header: 'Paid',
                cell: ({ row }) => (
                    <span className="text-green-600 font-medium tabular-nums">
                        {row.original.currency} {Number(row.original.paid_amount).toFixed(2)}
                    </span>
                ),
            },
            {
                accessorKey: 'balance',
                header: 'Balance',
                cell: ({ row }) => {
                    const balance = Number(row.original.balance);
                    return (
                        <span
                            className={`font-semibold tabular-nums ${
                                balance > 0 ? 'text-destructive' : 'text-muted-foreground'
                            }`}
                        >
                            {row.original.currency} {balance.toFixed(2)}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'due_date',
                header: 'Due Date',
                cell: ({ row }) => {
                    const dateVal = row.original.due_date;
                    if (!dateVal) return <span className="text-muted-foreground">—</span>;
                    return (
                        <span className="text-xs">
                            {new Date(dateVal).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge
                        variant="outline"
                        className={statusClass[row.original.status] ?? badgeToneClasses.neutral}
                    >
                        {row.original.status.toUpperCase()}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <Button asChild size="icon" variant="ghost" title="View Invoice">
                            <Link href={`/finance/invoices/${row.original.id}`}>
                                <Eye className="size-4 text-[#FF8500]" />
                            </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" title="Print Invoice">
                            <Link href={`/finance/${row.original.id}/print`}>
                                <Printer className="size-4 text-primary" />
                            </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" title="Edit Invoice">
                            <Link href={`/finance/invoices/${row.original.id}/edit`}>
                                <Edit className="size-4 text-[#004317] dark:text-green-300" />
                            </Link>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            title="Delete Invoice"
                            onClick={() => handleDelete(row.original)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    const sections: StatSection[] = [
        {
            title: 'Total Invoices',
            value: stats.totalInvoices,
            description: 'All invoices issued',
            icon: Receipt,
            color: 'primary',
        },
        {
            title: 'Invoiced Value',
            value: `$${stats.totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: 'Gross billed amount',
            icon: DollarSign,
            color: 'info',
        },
        {
            title: 'Collected',
            value: `$${stats.totalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: `${stats.paidCount} fully paid`,
            icon: CheckCircle2,
            color: 'success',
        },
        {
            title: 'Balance Due',
            value: `$${stats.totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: `${stats.overdueCount} overdue`,
            icon: AlertCircle,
            color: stats.totalBalance > 0 ? 'destructive' : 'warning',
        },
    ];

    return (
        <>
            <Head title="Invoices — SOMFIX" />
            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">Invoices</h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage tenant billing, rent charges, payment tracking, and balance collection.
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href="/finance/invoices/create">
                            <Plus className="size-4" />
                            Create Invoice
                        </Link>
                    </Button>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in duration-1000 fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Invoices"
                        searchTitle="Filter by invoice #, title, tenant..."
                        columns={columns}
                        data={invoices}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Invoice"
                description={
                    <>
                        Are you sure you want to delete invoice{' '}
                        <strong>{invoiceToDelete?.invoice_number}</strong>? This action cannot be
                        undone.
                    </>
                }
                processing={isDeleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

InvoicesIndex.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({
    breadcrumbs: [
        {
            title: 'Finance',
            href: '/finance',
        },
        {
            title: 'Invoices',
            href: '/finance/invoices',
        },
    ],
});
