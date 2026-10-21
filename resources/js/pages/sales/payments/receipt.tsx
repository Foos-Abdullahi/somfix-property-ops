import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
export default function Receipt({ payment }: { payment: any }) {
    const invoice = payment.invoice;
    return (
        <>
            <Head title={`Receipt ${payment.payment_number} — SOMFIX`} />
            <div className="mx-auto max-w-md p-4 md:p-8">
                <div className="rounded border bg-card p-6">
                    <div className="text-center">
                        <h1 className="text-xl font-bold">
                            SOMFIX Property Ops
                        </h1>
                        <p className="mt-2 text-xs text-muted-foreground">
                            PAYMENT RECEIPT
                        </p>
                    </div>
                    <hr className="my-5" />
                    <dl className="space-y-3 text-sm">
                        <Line label="Receipt" value={payment.payment_number} />
                        <Line label="Invoice" value={invoice.invoice_number} />
                        <Line
                            label="Customer"
                            value={
                                invoice.job?.customer?.name ??
                                invoice.recipient_name ??
                                '—'
                            }
                        />
                        <Line label="Date" value={payment.paid_at} />
                        <Line
                            label="Method"
                            value={payment.method.replaceAll('_', ' ')}
                        />
                        <Line
                            label="Reference"
                            value={payment.reference ?? '—'}
                        />
                        <div className="flex justify-between border-t pt-3 text-base font-bold">
                            <dt>Amount received</dt>
                            <dd>
                                {invoice.currency}{' '}
                                {Number(payment.amount).toFixed(2)}
                            </dd>
                        </div>
                    </dl>
                    <hr className="my-5" />
                    <p className="text-center text-xs text-muted-foreground">
                        Thank you for your payment.
                    </p>
                    <div className="no-print mt-5 flex justify-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/finance/invoices/${invoice.id}`}>
                                Invoice
                            </Link>
                        </Button>
                        <Button onClick={() => window.print()}>
                            Print receipt
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
function Line({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right capitalize">{value}</dd>
        </div>
    );
}
