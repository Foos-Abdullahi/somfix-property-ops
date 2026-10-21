import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type LineItem = {
    description: string;
    quantity: string | number;
    unit_price: string | number;
    amount?: string | number;
    total?: string | number;
};

type Finance = {
    id: number;
    invoice_number: string;
    title: string;
    description: string;
    type: 'invoice' | 'quote' | 'expense';
    currency: string;
    amount: string | number;
    paid_amount: string | number;
    balance: string | number;
    due_date: string | null;
    paid_date: string | null;
    status: string;
    created_at: string;
    property: { id: number; name: string } | null;
    unit: { id: number; unit_number: string } | null;
    tenant: {
        id: number;
        first_name: string;
        last_name: string;
        phone?: string;
        email?: string;
    } | null;
    recipient_name: string | null;
    recipient_email: string | null;
    notes: string | null;
    line_items?: LineItem[];
};

type PrintPageProps = {
    finance: Finance;
    company?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
};

function parseLineItems(
    description: string,
    defaultAmount: string | number,
    currency: string,
): LineItem[] {
    const lines = (description || '')
        .split('\n')
        .filter((l) => l.trim().startsWith('•'));
    if (lines.length === 0) {
        return [
            {
                description: description || 'Service / Rental',
                quantity: 1,
                unit_price: defaultAmount,
                total: defaultAmount,
            },
        ];
    }
    return lines.map((line) => {
        const match = line.match(
            /•\s*(.+?)\s*\(qty:\s*([\d.]+)\s*×\s*[A-Z]+\s*([\d.]+)\)/,
        );
        if (match) {
            const [, desc, qty, price] = match;
            return {
                description: desc.trim(),
                quantity: qty,
                unit_price: price,
                total: (parseFloat(qty) * parseFloat(price)).toFixed(2),
            };
        }
        return {
            description: line.replace('•', '').trim(),
            quantity: 1,
            unit_price: defaultAmount,
            total: defaultAmount,
        };
    });
}

export default function FinancePrint({ finance, company }: PrintPageProps) {
    const isInvoice = finance.type === 'invoice';
    const isQuote = finance.type === 'quote';
    const docLabel = isInvoice ? 'INVOICE' : isQuote ? 'QUOTATION' : 'FINANCE';

    const grandTotal = Number(finance.amount || 0);
    const totalPaid = Number(finance.paid_amount || 0);
    const balanceDue = Number(finance.balance || 0);

    const items: LineItem[] =
        finance.line_items && finance.line_items.length > 0
            ? finance.line_items.map((it) => ({
                  description: it.description,
                  quantity: it.quantity,
                  unit_price: it.unit_price,
                  total:
                      it.amount ??
                      it.total ??
                      (Number(it.quantity) * Number(it.unit_price)).toFixed(2),
              }))
            : parseLineItems(
                  finance.description,
                  finance.amount,
                  finance.currency,
              );

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `${dateStr} · ${timeStr}`;
    };

    const formatShortDate = (dateString: string | null | undefined) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatMoney = (val: number | string) => {
        const num = Number(val || 0);
        const prefix = finance.currency === 'SOS' ? 'SOS ' : '$';
        return `${prefix}${num.toFixed(2)}`;
    };

    const companyName = company?.name || 'SOMFIX Property Ops';
    const companyAddress = company?.address || 'Mogadishu, Somalia';
    const companyPhone = company?.phone || '+252 61 000 0000';
    const companyEmail = company?.email || 'info@somfix.com';

    const recipient =
        finance.recipient_name ||
        (finance.tenant
            ? `${finance.tenant.first_name} ${finance.tenant.last_name}`
            : '—');

    const backUrl = isInvoice
        ? `/finance/invoices/${finance.id}`
        : isQuote
          ? `/finance/quotations/${finance.id}`
          : `/finance/${finance.id}`;

    return (
        <>
            <Head title={`${docLabel} - ${finance.invoice_number}`} />

            <div className="flex min-h-screen animate-in flex-col items-center justify-center bg-[#FBF9F4] p-4 duration-300 fade-in slide-in-from-bottom-3 md:p-8 dark:bg-background">
                {/* Top Action Bar */}
                <div className="no-print mb-4 flex w-full max-w-md items-center justify-between">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5 bg-white text-xs shadow-xs hover:bg-muted dark:bg-card"
                    >
                        <Link href={backUrl}>
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to{' '}
                            {isInvoice
                                ? 'Invoice'
                                : isQuote
                                  ? 'Quotation'
                                  : 'Details'}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handlePrint}
                            className="justify-center gap-1.5 bg-[#1f1610] text-xs text-white shadow-xs hover:bg-[#2d2117] dark:bg-primary dark:hover:bg-primary/90"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Print {isInvoice ? 'Invoice' : 'Quotation'}
                        </Button>
                    </div>
                </div>

                {/* Receipt / Invoice Card */}
                <div className="mx-auto h-fit w-full max-w-md rounded-2xl border border-border/80 bg-white p-6 text-foreground shadow-sm md:p-8 dark:bg-card">
                    {/* Header - POS / Receipt Style */}
                    <div className="mb-4 text-center">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {companyName}
                        </h1>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {companyAddress} · {companyPhone}
                        </p>
                        {companyEmail && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {companyEmail}
                            </p>
                        )}
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {formatDate(finance.created_at)}
                        </p>
                        <div className="mt-3">
                            <span
                                className={`inline-block rounded-md px-3 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${
                                    isQuote
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                        : 'bg-muted text-foreground/80'
                                }`}
                            >
                                {docLabel}
                            </span>
                        </div>
                    </div>

                    <Separator className="my-3.5" />

                    {/* Document Meta Details */}
                    <div className="my-3 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {isInvoice
                                    ? 'Invoice #'
                                    : isQuote
                                      ? 'Quote #'
                                      : 'Record #'}
                            </span>
                            <span className="font-semibold text-foreground">
                                {finance.invoice_number}
                            </span>
                        </div>

                        {finance.title && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Title
                                </span>
                                <span className="max-w-[220px] truncate text-right font-medium text-foreground">
                                    {finance.title}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {isInvoice ? 'Client / Tenant' : 'Prepared For'}
                            </span>
                            <span className="text-right font-semibold text-foreground">
                                {recipient}
                            </span>
                        </div>

                        {(finance.property || finance.unit) && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Property / Unit
                                </span>
                                <span className="text-right font-medium text-foreground">
                                    {[
                                        finance.property?.name,
                                        finance.unit
                                            ? `Unit ${finance.unit.unit_number}`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </div>
                        )}

                        {finance.due_date && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {isInvoice ? 'Due Date' : 'Valid Until'}
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatShortDate(finance.due_date)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span className="font-medium text-foreground capitalize">
                                {finance.status}
                            </span>
                        </div>
                    </div>

                    <Separator className="my-3.5" />

                    {/* Items Table */}
                    <div className="mt-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                                        Item
                                    </th>
                                    <th className="w-12 py-2 text-center text-xs font-semibold text-muted-foreground uppercase">
                                        Qty
                                    </th>
                                    <th className="w-20 py-2 text-right text-xs font-semibold text-muted-foreground uppercase">
                                        Price
                                    </th>
                                    <th className="w-20 py-2 text-right text-xs font-semibold text-muted-foreground uppercase">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-border/50"
                                    >
                                        <td className="py-2 font-medium text-foreground">
                                            {item.description}
                                        </td>
                                        <td className="py-2 text-center font-mono text-foreground">
                                            {item.quantity}
                                        </td>
                                        <td className="py-2 text-right font-mono text-muted-foreground">
                                            {formatMoney(item.unit_price)}
                                        </td>
                                        <td className="py-2 text-right font-mono font-semibold text-foreground">
                                            {formatMoney(
                                                item.total ??
                                                    Number(item.quantity) *
                                                        Number(item.unit_price),
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!items || items.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-4 text-center text-xs text-muted-foreground"
                                        >
                                            No items listed.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-mono">
                                {formatMoney(grandTotal)}
                            </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between pt-0.5 text-base font-bold text-foreground">
                            <span>Total</span>
                            <span className="font-mono">
                                {formatMoney(grandTotal)}
                            </span>
                        </div>
                        {isInvoice && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Paid</span>
                                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatMoney(totalPaid)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Balance Due</span>
                                    <span
                                        className={`font-mono font-semibold ${
                                            balanceDue > 0
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                    >
                                        {formatMoney(balanceDue)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {(isInvoice || isQuote) && (
                        <div className="mt-4 border-t border-border pt-3">
                            <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Payment Details
                            </h2>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Merchant Number
                                    </span>
                                    <span className="font-mono font-semibold">
                                        65 21 09
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Payment Code
                                    </span>
                                    <span className="font-mono font-semibold whitespace-nowrap">
                                        {'*789*652109*$#'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">
                                    Replace $ with the amount you wish to pay.
                                    {isQuote &&
                                        ' Pay only after the quotation is accepted and payment is agreed.'}
                                </p>
                                <p className="text-muted-foreground">
                                    Use {finance.invoice_number} as your payment
                                    reference when available.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notes / Property Info */}
                    {finance.notes && (
                        <div className="mt-4 border-t border-border pt-3">
                            <p className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                {isQuote ? 'Terms & Notes' : 'Payment Notes'}
                            </p>
                            <p className="text-xs whitespace-pre-wrap text-muted-foreground">
                                {finance.notes}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="my-6 text-center text-xs text-muted-foreground">
                        <p>Thank you for your business! · {companyName}</p>
                    </div>

                    {/* Print Button inside card */}
                    <div className="no-print mt-4 flex items-center justify-center border-t border-border pt-4">
                        <Button
                            className="w-full justify-center gap-2 bg-[#1f1610] text-white shadow-xs hover:bg-[#2d2117] dark:bg-primary dark:hover:bg-primary/90"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4" />
                            Print {isInvoice ? 'Invoice' : 'Quotation'}
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    html, body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: flex-start !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    header, nav, aside {
                        display: none !important;
                    }
                    .animate-in {
                        width: 100% !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .max-w-md, .bg-card, .bg-white {
                        max-width: 420px !important;
                        margin: 0 auto !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 12px !important;
                    }
                    @page {
                        margin: 8mm auto;
                        size: auto;
                    }
                    * {
                        page-break-inside: avoid !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </>
    );
}

FinancePrint.layout = {
    breadcrumbs: [
        { title: 'Finance', href: '/finance' },
        { title: 'Print Document' },
    ],
};
