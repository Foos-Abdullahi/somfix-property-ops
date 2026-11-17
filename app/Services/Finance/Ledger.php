<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\PayrollEntry;
use App\Models\PropertyExpense;
use App\Models\RentCollection;
use App\Models\TechnicianPayout;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Every recorded money movement, in one list, each tied back to the job,
 * property, technician or invoice it belongs to.
 *
 * "company" money is SOMFIX's own; "client" money is rent held for owners.
 */
class Ledger
{
    public const KINDS = [
        'customer_payment' => 'Customer payment',
        'rent_collection' => 'Rent collected',
        'expense' => 'Operating expense',
        'technician_payout' => 'Technician commission',
        'payroll' => 'Salary',
        'owner_payout' => 'Owner payout',
        'property_expense' => 'Owner expense (at cost)',
    ];

    /** @return Collection<int, array<string, mixed>> */
    public function entries(?CarbonInterface $from = null, ?CarbonInterface $to = null): Collection
    {
        $range = fn ($query, string $column) => $query
            ->when($from, fn ($q) => $q->whereDate($column, '>=', $from))
            ->when($to, fn ($q) => $q->whereDate($column, '<=', $to));

        $entries = collect();

        $range(Payment::query()->with('invoice.job.customer'), 'paid_at')->get()->each(function (Payment $p) use ($entries): void {
            $invoice = $p->invoice;
            $entries->push($this->row('customer_payment', $p->id, $p->paid_at, 'in', 'company', $p->payment_number.' · '.($invoice?->invoice_number ?? 'invoice'), $invoice?->job?->customer?->name ?? $invoice?->recipient_name, (float) $p->amount, $p->method, $p->reference, 'paid', '/finance/payments/'.$p->id, $invoice?->job, $invoice));
        });

        $range(RentCollection::query()->with('property'), 'received_date')->get()->each(function (RentCollection $r) use ($entries): void {
            $entries->push($this->row('rent_collection', $r->id, $r->received_date, 'in', 'client', $r->receipt_number.' · rent '.$r->rent_month->format('M Y'), $r->tenant_name ?: $r->property?->name, (float) $r->amount_collected, $r->payment_method, $r->reference, 'received', '/finance/rent/'.$r->id, null, null, $r->property?->name));
        });

        $range(Expense::query()->with('job')->where('status', 'paid'), 'expense_date')->get()->each(function (Expense $e) use ($entries): void {
            $entries->push($this->row('expense', $e->id, $e->expense_date, 'out', 'company', $e->expense_number.' · '.$e->description, $e->vendor, (float) $e->amount, $e->payment_method, $e->reference, 'paid', '/finance/expenses/'.$e->id, $e->job, null, null, $e->category));
        });

        $range(TechnicianPayout::query()->with(['serviceTeam', 'job'])->where('status', 'paid'), 'paid_at')->get()->each(function (TechnicianPayout $t) use ($entries): void {
            $entries->push($this->row('technician_payout', $t->id, $t->paid_at, 'out', 'company', $t->payout_number.' · commission', $t->serviceTeam?->name, (float) $t->amount, $t->payment_method, $t->reference, 'paid', '/finance/commissions/'.$t->id, $t->job, null, null, null, $t->serviceTeam?->name));
        });

        $range(PayrollEntry::query()->with('serviceTeam')->where('status', 'paid'), 'paid_at')->get()->each(function (PayrollEntry $p) use ($entries): void {
            $entries->push($this->row('payroll', $p->id, $p->paid_at, 'out', 'company', $p->payroll_number.' · salary '.$p->pay_month->format('M Y'), $p->serviceTeam?->name, (float) $p->net_pay, $p->payment_method, $p->reference, 'paid', '/finance/payroll/'.$p->id, null, null, null, null, $p->serviceTeam?->name));
        });

        $range(OwnerPayout::query()->with('property'), 'payout_date')->get()->each(function (OwnerPayout $o) use ($entries): void {
            $entries->push($this->row('owner_payout', $o->id, $o->payout_date, 'out', 'client', $o->payout_number.' · owner remittance', $o->property?->owner_name, (float) $o->amount, $o->payment_method, $o->reference, 'paid', '/finance/owner-payouts/'.$o->id, null, null, $o->property?->name));
        });

        $range(PropertyExpense::query()->with(['property', 'job']), 'expense_date')->get()->each(function (PropertyExpense $e) use ($entries): void {
            $entries->push($this->row('property_expense', $e->id, $e->expense_date, 'out', 'client', $e->expense_number.' · '.$e->description, $e->vendor, (float) $e->amount, $e->payment_method, $e->reference, 'paid', '/finance/property-expenses/'.$e->id, $e->job, null, $e->property?->name, $e->category));
        });

        return $entries->sortByDesc(fn (array $e) => $e['date'].'-'.str_pad((string) $e['id'], 8, '0', STR_PAD_LEFT))->values();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $entries
     * @return array<string, float>
     */
    public function totals(Collection $entries): array
    {
        $sum = fn (string $direction, string $fund) => round((float) $entries->where('direction', $direction)->where('fund', $fund)->sum('amount'), 2);

        $in = $sum('in', 'company');
        $out = $sum('out', 'company');
        $clientIn = $sum('in', 'client');
        $clientOut = $sum('out', 'client');

        return [
            'cashIn' => $in, 'cashOut' => $out, 'net' => round($in - $out, 2),
            'clientIn' => $clientIn, 'clientOut' => $clientOut, 'clientHeld' => round($clientIn - $clientOut, 2),
        ];
    }

    /** @return array<string, mixed> */
    private function row(string $kind, int $id, ?CarbonInterface $date, string $direction, string $fund, string $title, ?string $party, float $amount, ?string $method, ?string $reference, string $status, string $url, $job = null, $invoice = null, ?string $property = null, ?string $category = null, ?string $technician = null): array
    {
        return [
            'key' => $kind.'-'.$id, 'id' => $id, 'kind' => $kind, 'kind_label' => self::KINDS[$kind],
            'date' => $date?->toDateString(), 'direction' => $direction, 'fund' => $fund,
            'title' => $title, 'party' => $party, 'amount' => round($amount, 2),
            'method' => $method, 'reference' => $reference, 'status' => $status, 'url' => $url,
            'job_id' => $job?->id, 'job_number' => $job?->job_number,
            'invoice_id' => $invoice?->id, 'invoice_number' => $invoice?->invoice_number,
            'property' => $property, 'category' => $category, 'technician' => $technician,
        ];
    }
}
