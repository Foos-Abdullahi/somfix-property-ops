<?php

namespace App\Http\Controllers\Finance;

use App\Models\Finance;
use App\Models\Payment;
use App\Services\Finance\InvoiceService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/** Money received from customers against invoices. Every change re-derives the invoice balance. */
class PaymentController extends ResourceController
{
    protected string $key = 'payments';

    protected string $modelClass = Payment::class;

    protected string $label = 'Payment';

    protected string $dateColumn = 'paid_at';

    protected array $with = ['invoice.job.customer'];

    protected ?array $number = ['PAY', 'payment_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        $invoiceId = $record?->finance_id ?? $request->input('finance_id');

        return [
            'finance_id' => $record ? ['prohibited'] : ['required', 'exists:finances,id'],
            'amount' => ['required', 'numeric', 'gt:0', function ($attribute, $value, $fail) use ($invoiceId, $record): void {
                $invoice = Finance::query()->find($invoiceId);
                if (! $invoice || $invoice->type !== 'invoice' || in_array($invoice->status, ['draft', 'cancelled'], true)) {
                    $fail('Payments can only be recorded against issued invoices.');

                    return;
                }
                $room = (float) $invoice->balance + (float) ($record?->amount ?? 0);
                if ((float) $value > $room + 0.001) {
                    $fail('This is more than the invoice balance ($'.number_format($room, 2).').');
                }
            }],
            'method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        if (! $record) {
            $data['received_by'] = $request->user()?->name;
        }

        return $data;
    }

    protected function saved(Model $record, bool $created): void
    {
        app(InvoiceService::class)->recalculate($record->invoice()->firstOrFail());
    }

    protected function deleted(Model $record): void
    {
        if ($invoice = Finance::query()->find($record->finance_id)) {
            app(InvoiceService::class)->recalculate($invoice);
        }
    }

    protected function options(?Model $record = null): array
    {
        $invoices = Finance::query()->with('job.customer:id,name')->where('type', 'invoice')
            ->where(fn ($q) => $q->where(fn ($q) => $q->where('balance', '>', 0)->whereNotIn('status', ['draft', 'cancelled']))->when($record, fn ($q) => $q->orWhere('id', $record->finance_id)))
            ->orderByDesc('id')->get();

        return [
            'methods' => config('finance.payment_methods'),
            'invoices' => $invoices->map(fn (Finance $i) => [
                'id' => $i->id, 'invoice_number' => $i->invoice_number, 'title' => $i->title, 'balance' => (float) $i->balance, 'amount' => (float) $i->amount,
                'client' => $i->job?->customer?->name ?? $i->recipient_name, 'job_number' => $i->job?->job_number,
            ])->values(),
        ];
    }

    protected function defaults(Request $request): array
    {
        $invoice = $request->integer('finance_id') ? Finance::query()->find($request->integer('finance_id')) : null;

        return ['finance_id' => $invoice?->id, 'amount' => $invoice && (float) $invoice->balance > 0 ? (float) $invoice->balance : null, 'paid_at' => now()->toDateString()];
    }

    protected function detail(Model $record): array
    {
        $invoice = $record->invoice;

        return ['siblings' => $invoice ? $invoice->payments()->orderBy('paid_at')->get(['id', 'payment_number', 'amount', 'paid_at', 'method']) : []];
    }

    protected function stats(Collection $records): array
    {
        $outstanding = Finance::query()->where('type', 'invoice')->whereNotIn('status', ['draft', 'cancelled'])->sum('balance');

        return [
            'total' => round((float) $records->sum('amount'), 2),
            'thisMonth' => round((float) $records->filter(fn ($p) => $p->paid_at->isSameMonth(now()))->sum('amount'), 2),
            'count' => $records->count(),
            'outstanding' => round((float) $outstanding, 2),
            'byMethod' => $records->groupBy('method')->map(fn ($rows, $m) => ['label' => config('finance.payment_methods.'.$m, $m), 'value' => round((float) $rows->sum('amount'), 2)])->sortByDesc('value')->values(),
        ];
    }
}
