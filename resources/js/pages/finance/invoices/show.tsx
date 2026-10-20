import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Pencil,
    Printer,
    CircleDollarSign,
    Receipt,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Can } from '@/components/can';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type LineItem = {
    description: string;
    quantity: string;
    unit_price: string;
    amount: string;
};

type InvoiceDetail = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: string;
    currency: string;
    amount: string;
    paid_amount: string;
    balance: string;
    due_date: string | null;
    paid_date: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    property: { id: number; name: string } | null;
    unit: { id: number; unit_number: string } | null;
    tenant: { id: number; first_name: string; last_name: string; email?: string } | null;
    recipient_name: string | null;
    recipient_email: string | null;
    line_items?: LineItem[];
};

const statusClass: Record<string, string> = {
    draft: badgeToneClasses.neutral,
    sent: badgeToneClasses.info,
    paid: badgeToneClasses.success,
    overdue: badgeToneClasses.danger,
    cancelled: badgeToneClasses.neutral,
};

export default function ShowInvoicePage({ finance }: { finance: InvoiceDetail }) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/finance/invoices/${finance.id}`, {
            onSuccess: () => {
                toast.success('Invoice deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete invoice');
                setIsDeleting(false);
            },
        });
    };

    const recipientName =
        finance.recipient_name ||
        (finance.tenant ? `${finance.tenant.first_name} ${finance.tenant.last_name}` : '—');
    const recipientEmail = finance.recipient_email || finance.tenant?.email;

    const lineItems =
        finance.line_items && finance.line_items.length > 0
            ? finance.line_items
            : [
                  {
                      description: finance.title || 'Item',
                      quantity: '1',
                      unit_price: finance.amount,
                      amount: finance.amount,
                  },
              ];

    const balanceNum = Number(finance.balance);

    return (
        <>
            <Head title={`Invoice ${finance.invoice_number} — SOMFIX`} />
            <div className="mx-auto w-full max-w-screen-2xl space-y-3 p-4 sm:p-6">
                {/* Header Card matching service-team/2 and tenants/show.tsx */}
                <header className="flex flex-col gap-4 rounded-xs border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between shadow-none">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xs border border-primary/15 bg-primary/10 text-primary">
                            <Receipt className="size-6" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold [overflow-wrap:anywhere] break-words">
                                    {finance.invoice_number}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`rounded-xs text-[11px] ${
                                        statusClass[finance.status] ?? badgeToneClasses.neutral
                                    }`}
                                >
                                    {finance.status.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-sm break-words text-muted-foreground">
                                {finance.title} · Created on{' '}
                                {new Date(finance.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/finance/invoices">
                                <ArrowLeft />
                                Back
                            </Link>
                        </Button>
                        <Can permission="finance.manage">
                            {balanceNum > 0 && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/sales/invoices/${finance.id}/payments/create`}>
                                        <CircleDollarSign />
                                        Record Payment
                                    </Link>
                                </Button>
                            )}
                        </Can>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/finance/${finance.id}/print`}>
                                <Printer />
                                Print / PDF
                            </Link>
                        </Button>
                        <Can permission="finance.manage">
                            <Button asChild size="sm">
                                <Link href={`/finance/invoices/${finance.id}/edit`}>
                                    <Pencil />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 />
                                Delete
                            </Button>
                        </Can>
                    </div>
                </header>

                {/* 12-Column Grid with gap-3 matching service-team/2 */}
                <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
                    {/* Left / Main Section (8 cols) */}
                    <div className="min-w-0 space-y-3 lg:col-span-8">
                        {/* Line Items Card */}
                        <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
                            <CardHeader className="px-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Invoice Line Items
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                <th className="py-2.5 text-left font-semibold">Description</th>
                                                <th className="py-2.5 text-center w-20 font-semibold">Qty</th>
                                                <th className="py-2.5 text-right w-28 font-semibold">Unit Price</th>
                                                <th className="py-2.5 text-right w-28 font-semibold">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {lineItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-muted/30">
                                                    <td className="py-3 font-medium text-foreground">
                                                        {item.description}
                                                    </td>
                                                    <td className="py-3 text-center text-muted-foreground">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3 text-right tabular-nums text-muted-foreground">
                                                        {finance.currency}{' '}
                                                        {Number(item.unit_price).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                                                        {finance.currency}{' '}
                                                        {Number(item.amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes & Description Card */}
                        {(finance.notes || finance.description) && (
                            <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
                                <CardHeader className="px-4">
                                    <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Notes & Instructions
                                    </h2>
                                </CardHeader>
                                <CardContent className="px-4">
                                    <p className="text-sm leading-7 [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-muted-foreground">
                                        {finance.notes || finance.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right / Sidebar Section (4 cols) */}
                    <div className="min-w-0 space-y-3 lg:col-span-4">
                        {/* Financial Summary Card */}
                        <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
                            <CardHeader className="px-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Payment Summary
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4">
                                <div className="rounded-xs bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Outstanding Balance
                                    </p>
                                    <p
                                        className={`mt-1 text-2xl font-semibold tracking-tight break-words tabular-nums ${
                                            balanceNum > 0
                                                ? 'text-destructive'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {finance.currency} {balanceNum.toFixed(2)}
                                    </p>
                                </div>
                                <dl className="divide-y divide-border/60">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                        <dt className="text-sm text-muted-foreground">Total Invoiced</dt>
                                        <dd className="min-w-0 text-sm font-medium tabular-nums">
                                            {finance.currency} {Number(finance.amount).toFixed(2)}
                                        </dd>
                                    </div>
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                        <dt className="text-sm text-muted-foreground">Amount Paid</dt>
                                        <dd className="min-w-0 text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
                                            {finance.currency}{' '}
                                            {Number(finance.paid_amount).toFixed(2)}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Recipient Information Card */}
                        <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
                            <CardHeader className="px-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Billing Details
                                </h2>
                            </CardHeader>
                            <CardContent className="px-4">
                                <dl className="divide-y divide-border/60">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                        <dt className="text-sm text-muted-foreground">Client / Tenant</dt>
                                        <dd className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] break-words">
                                            {recipientName}
                                        </dd>
                                    </div>
                                    {recipientEmail && (
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                            <dt className="text-sm text-muted-foreground">Email</dt>
                                            <dd className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] break-words">
                                                {recipientEmail}
                                            </dd>
                                        </div>
                                    )}
                                    {finance.property && (
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                            <dt className="text-sm text-muted-foreground">Property</dt>
                                            <dd className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] break-words">
                                                {finance.property.name}
                                            </dd>
                                        </div>
                                    )}
                                    {finance.unit && (
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                            <dt className="text-sm text-muted-foreground">Unit</dt>
                                            <dd className="min-w-0 text-sm font-medium [overflow-wrap:anywhere] break-words">
                                                {finance.unit.unit_number}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Timeline & Dates Card */}
                        <Card className="min-w-0 gap-3 rounded-xs py-4 shadow-none">
                            <CardHeader className="px-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Timeline & Dates
                                </h2>
                            </CardHeader>
                            <CardContent className="px-4">
                                <dl className="divide-y divide-border/60">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                        <dt className="text-sm text-muted-foreground">Issue Date</dt>
                                        <dd className="min-w-0 text-sm font-medium">
                                            {new Date(finance.created_at).toLocaleDateString(
                                                'en-US',
                                                { month: 'short', day: 'numeric', year: 'numeric' },
                                            )}
                                        </dd>
                                    </div>
                                    {finance.due_date && (
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                            <dt className="text-sm text-muted-foreground">Due Date</dt>
                                            <dd className="min-w-0 text-sm font-medium">
                                                {new Date(finance.due_date).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                    {finance.paid_date && (
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                                            <dt className="text-sm text-muted-foreground">Paid Date</dt>
                                            <dd className="min-w-0 text-sm font-semibold text-green-600 dark:text-green-400">
                                                {new Date(finance.paid_date).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Invoice"
                description={
                    <>
                        Are you sure you want to delete invoice{' '}
                        <strong>{finance.invoice_number}</strong>? This action cannot be undone.
                    </>
                }
                processing={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}

ShowInvoicePage.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({
    breadcrumbs: [
        {
            title: 'Finance',
            href: '/finance',
        },
        {
            title: 'Invoices',
            href: '/finance/invoices',
        },
        {
            title: 'Invoice Details',
            href: '',
        },
    ],
});
