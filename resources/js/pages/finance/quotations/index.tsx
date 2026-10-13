import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ArrowRightLeft,
    Clock,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Plus,
    Printer,
    Send,
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

export type QuotationRow = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: string;
    currency: string;
    amount: string;
    balance: string;
    status: string;
    due_date: string | null;
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
    cancelled: badgeToneClasses.danger,
};

export default function QuotationsIndex({
    quotations,
    stats,
}: {
    quotations: QuotationRow[];
    stats: {
        totalQuotations: number;
        totalAmount: number;
        draftCount: number;
        sentCount: number;
    };
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<QuotationRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConverting, setIsConverting] = useState<number | null>(null);

    const handleDelete = (quote: QuotationRow) => {
        setQuoteToDelete(quote);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!quoteToDelete || isDeleting) return;

        router.delete(`/finance/quotations/${quoteToDelete.id}`, {
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => {
                toast.success('Quotation deleted successfully');
                setDeleteDialogOpen(false);
                setQuoteToDelete(null);
            },
            onError: () => {
                toast.error('Could not delete quotation');
                setIsDeleting(false);
            },
        });
    };

    const handleConvert = (quote: QuotationRow) => {
        setIsConverting(quote.id);
        router.post(
            `/finance/quotations/${quote.id}/convert`,
            {},
            {
                onFinish: () => setIsConverting(null),
                onError: () => toast.error('Failed to convert quotation to invoice'),
            },
        );
    };

    const columns = useMemo<ColumnDef<QuotationRow>[]>(
        () => [
            {
                accessorKey: 'invoice_number',
                header: 'Quote #',
                cell: ({ row }) => (
                    <div>
                        <Link
                            href={`/finance/quotations/${row.original.id}`}
                            className="font-semibold text-amber-600 hover:underline dark:text-amber-400"
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
                header: 'Recipient / Client',
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
                header: 'Quoted Amount',
                cell: ({ row }) => (
                    <span className="font-semibold tabular-nums">
                        {row.original.currency} {Number(row.original.amount).toFixed(2)}
                    </span>
                ),
            },
            {
                accessorKey: 'due_date',
                header: 'Valid Until',
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
                        <Button asChild size="icon" variant="ghost" title="View Quotation">
                            <Link href={`/finance/quotations/${row.original.id}`}>
                                <Eye className="size-4 text-[#FF8500]" />
                            </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" title="Print Quotation">
                            <Link href={`/finance/${row.original.id}/print`}>
                                <Printer className="size-4 text-primary" />
                            </Link>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            title="Convert to Invoice"
                            disabled={isConverting === row.original.id}
                            onClick={() => handleConvert(row.original)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            <ArrowRightLeft className="size-4" />
                        </Button>
                        <Button asChild size="icon" variant="ghost" title="Edit Quotation">
                            <Link href={`/finance/quotations/${row.original.id}/edit`}>
                                <Edit className="size-4 text-[#004317] dark:text-green-300" />
                            </Link>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            title="Delete Quotation"
                            onClick={() => handleDelete(row.original)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [isConverting],
    );

    const sections: StatSection[] = [
        {
            title: 'Total Quotations',
            value: stats.totalQuotations,
            description: 'All quotes created',
            icon: FileText,
            color: 'primary',
        },
        {
            title: 'Quoted Value',
            value: `$${stats.totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            description: 'Total estimated amount',
            icon: DollarSign,
            color: 'info',
        },
        {
            title: 'Sent Proposals',
            value: stats.sentCount,
            description: 'Awaiting customer response',
            icon: Send,
            color: 'warning',
        },
        {
            title: 'Draft Quotes',
            value: stats.draftCount,
            description: 'Ready to finalize',
            icon: Clock,
            color: 'accent',
        },
    ];

    return (
        <>
            <Head title="Quotations — SOMFIX" />
            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">Quotations</h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Create, send, and convert price estimates and proposals for property services.
                        </p>
                    </div>
                    <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Link href="/finance/quotations/create">
                            <Plus className="size-4" />
                            Create Quotation
                        </Link>
                    </Button>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in duration-1000 fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Quotations"
                        searchTitle="Filter by quote #, title, recipient..."
                        columns={columns}
                        data={quotations}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Quotation"
                description={
                    <>
                        Are you sure you want to delete quotation{' '}
                        <strong>{quoteToDelete?.invoice_number}</strong>? This action cannot be
                        undone.
                    </>
                }
                processing={isDeleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

QuotationsIndex.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({
    breadcrumbs: [
        {
            title: 'Finance',
            href: '/finance',
        },
        {
            title: 'Quotations',
            href: '/finance/quotations',
        },
    ],
});
