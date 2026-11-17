<?php

namespace App\Services\Finance;

use App\Models\Finance;

class InvoiceService
{
    /** Re-derive paid amount, balance and status from the invoice's payments. */
    public function recalculate(Finance $invoice): Finance
    {
        $paid = round((float) $invoice->payments()->sum('amount'), 2);
        $balance = round(max(0, (float) $invoice->amount - $paid), 2);
        $lastPayment = $invoice->payments()->max('paid_at');

        $status = $invoice->status;
        if ($status !== 'cancelled' && $status !== 'draft') {
            if ($balance <= 0 && (float) $invoice->amount > 0) {
                $status = 'paid';
            } elseif ($paid > 0) {
                $status = 'partially_paid';
            } elseif (in_array($status, ['paid', 'partially_paid'], true)) {
                $status = 'sent';
            }
            if ($balance > 0 && $invoice->due_date?->isPast() && in_array($status, ['sent', 'partially_paid'], true)) {
                $status = 'overdue';
            }
        }

        $invoice->update([
            'paid_amount' => $paid,
            'balance' => $balance,
            'paid_date' => $balance <= 0 && $paid > 0 ? $lastPayment : null,
            'status' => $status,
        ]);

        return $invoice;
    }
}
