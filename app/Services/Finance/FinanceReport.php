<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\Finance;
use App\Models\Job;
use App\Models\OwnerPayout;
use App\Models\PayrollEntry;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\RentCollection;
use App\Models\TechnicianPayout;
use Illuminate\Support\Collection;

/**
 * Profit, receivables and per-job / per-owner numbers.
 *
 * Accounting basis (same as the SOMFIX workbook):
 *  - Maintenance revenue = invoiced amount minus the materials passed through at cost.
 *  - Management revenue  = fee kept from rent when the rent is received.
 *  - Technician commission, payroll and operating expenses are costs in the month they are earned/incurred.
 *  - Rent, owner costs and materials are client funds, shown as memo lines and never as SOMFIX income.
 */
class FinanceReport
{
    /** Invoice states that count as billed (draft and cancelled documents do not). */
    public const BILLED = ['sent', 'partially_paid', 'paid', 'overdue'];

    /** @return Collection<int, array<string, mixed>> */
    public function jobs(?Collection $jobs = null): Collection
    {
        $jobs ??= Job::query()->latest()->get();
        $jobs->load(['customer:id,name,phone', 'materials', 'finances.payments', 'expenses', 'technicianPayouts.serviceTeam:id,name']);

        return $jobs->map(fn (Job $job) => $this->jobSummary($job))->values();
    }

    /** @return array<string, mixed> */
    public function jobSummary(Job $job): array
    {
        $invoices = $job->finances->where('type', 'invoice')->whereIn('status', self::BILLED);
        $billed = round((float) $invoices->sum('amount'), 2);
        $collected = round((float) $invoices->sum('paid_amount'), 2);
        $materials = round((float) $job->materials->sum(fn ($m) => (float) $m->quantity * (float) $m->unit_cost), 2);
        $serviceFee = round($billed - $materials, 2);
        $payouts = $job->technicianPayouts->where('status', '!=', 'cancelled');
        $commission = round((float) $payouts->sum('amount'), 2);
        $commissionPaid = round((float) $payouts->where('status', 'paid')->sum('amount'), 2);
        $expenses = round((float) $job->expenses->where('status', '!=', 'cancelled')->sum('amount'), 2);
        $net = round($serviceFee - $commission - $expenses, 2);

        return [
            'id' => $job->id, 'job_number' => $job->job_number, 'title' => $job->title, 'status' => $job->status,
            'customer' => $job->customer?->name, 'customer_id' => $job->customer_id,
            'date' => ($job->completed_date ?? $job->approved_date ?? $job->created_at)?->toDateString(),
            'approved_value' => (float) $job->approved_value,
            'billed' => $billed, 'collected' => $collected, 'outstanding' => round($billed - $collected, 2),
            'materials_cost' => $materials, 'service_fee' => $serviceFee,
            'commission' => $commission, 'commission_paid' => $commissionPaid, 'commission_due' => round($commission - $commissionPaid, 2),
            'direct_expenses' => $expenses, 'net_margin' => $net,
            'margin_pct' => $billed > 0 ? round($net / $billed * 100, 1) : null,
            'invoice_count' => $invoices->count(),
        ];
    }

    /**
     * Monthly profit & loss for a year.
     *
     * @return array<string, mixed>
     */
    public function profitAndLoss(int $year): array
    {
        $zero = array_fill(1, 12, 0.0);
        $add = function (array &$series, $date, float $amount): void {
            if ($date && (int) $date->format('Y') === $series['year']) {
                $series['m'][(int) $date->format('n')] += $amount;
            }
        };

        $blank = fn () => ['year' => $year, 'm' => $zero];
        $mgmt = $blank();
        $maintenance = $blank();
        $commission = $blank();
        $payroll = $blank();
        $unlinkedBilled = $blank();
        $materialsAtCost = $blank();
        $rent = $blank();
        $ownerCosts = $blank();
        $ownerPaid = $blank();
        $expenseByCategory = [];

        foreach (RentCollection::query()->whereYear('received_date', $year)->get() as $r) {
            $add($mgmt, $r->received_date, (float) $r->fee_amount);
            $add($rent, $r->received_date, (float) $r->amount_collected);
        }

        $jobs = Job::query()->with(['materials', 'finances'])->get()->keyBy('id');
        $allocatedFor = function (Finance $invoice) use ($jobs): float {
            $job = $jobs->get($invoice->job_id);
            if (! $job) {
                return 0.0;
            }
            $cost = (float) $job->materials->sum(fn ($m) => (float) $m->quantity * (float) $m->unit_cost);
            $billedTotal = (float) $job->finances->where('type', 'invoice')->whereIn('status', self::BILLED)->sum('amount');

            return $billedTotal > 0 ? $cost * (float) $invoice->amount / $billedTotal : 0.0;
        };
        foreach (Finance::query()->where('type', 'invoice')->whereIn('status', self::BILLED)->whereYear('created_at', $year)->get() as $invoice) {
            if ($invoice->job_id) {
                $materials = $allocatedFor($invoice);
                $add($maintenance, $invoice->created_at, (float) $invoice->amount - $materials);
                $add($materialsAtCost, $invoice->created_at, $materials);
            } else {
                $add($unlinkedBilled, $invoice->created_at, (float) $invoice->amount);
            }
        }

        foreach (TechnicianPayout::query()->where('status', '!=', 'cancelled')->whereYear('earned_date', $year)->get() as $t) {
            $add($commission, $t->earned_date, (float) $t->amount);
        }
        foreach (PayrollEntry::query()->whereYear('pay_month', $year)->get() as $p) {
            $add($payroll, $p->pay_month, (float) $p->gross_pay);
        }
        foreach (Expense::query()->where('status', '!=', 'cancelled')->whereYear('expense_date', $year)->get() as $e) {
            $expenseByCategory[$e->category] ??= $blank();
            $add($expenseByCategory[$e->category], $e->expense_date, (float) $e->amount);
        }
        foreach (PropertyExpense::query()->whereYear('expense_date', $year)->get() as $e) {
            $add($ownerCosts, $e->expense_date, (float) $e->amount);
        }
        foreach (OwnerPayout::query()->whereYear('payout_date', $year)->get() as $o) {
            $add($ownerPaid, $o->payout_date, (float) $o->amount);
        }

        ksort($expenseByCategory);
        $months = range(1, 12);
        $row = fn (string $label, array $series) => ['label' => $label, 'months' => array_map(fn ($m) => round($series['m'][$m], 2), $months), 'total' => round(array_sum($series['m']), 2)];
        $sum = fn (array ...$rows) => ['label' => '', 'months' => array_map(fn ($i) => round(array_sum(array_map(fn ($r) => $r['months'][$i], $rows)), 2), array_keys($months)), 'total' => round(array_sum(array_map(fn ($r) => $r['total'], $rows)), 2)];
        $diff = fn (array $a, array $b) => ['label' => '', 'months' => array_map(fn ($i) => round($a['months'][$i] - $b['months'][$i], 2), array_keys($months)), 'total' => round($a['total'] - $b['total'], 2)];

        $mgmtRow = $row('Property management fees', $mgmt);
        $maintRow = $row('Maintenance service fees', $maintenance);
        $revenue = ['label' => 'Total revenue'] + $sum($mgmtRow, $maintRow);
        $commissionRow = $row('Technician commissions', $commission);
        $gross = ['label' => 'Gross profit'] + $diff($revenue, $commissionRow);
        $payrollRow = $row('Salaries & wages (gross)', $payroll);
        $expenseRows = array_map(fn (string $c) => $row($c, $expenseByCategory[$c]), array_keys($expenseByCategory));
        $opex = ['label' => 'Total operating expenses'] + $sum($payrollRow, ...$expenseRows);
        $net = ['label' => 'Net profit'] + $diff($gross, $opex);

        return [
            'year' => $year,
            'revenue' => ['management' => $mgmtRow, 'maintenance' => $maintRow, 'total' => $revenue],
            'costOfServices' => ['commissions' => $commissionRow],
            'grossProfit' => $gross,
            'operating' => ['payroll' => $payrollRow, 'expenses' => $expenseRows, 'total' => $opex],
            'netProfit' => $net,
            'memo' => [
                'rentCollected' => $row('Rent collected for owners', $rent),
                'ownerCosts' => $row('Owner expenses paid at cost', $ownerCosts),
                'ownerPayouts' => $row('Paid out to owners', $ownerPaid),
                'materialsAtCost' => $row('Materials billed to customers at cost', $materialsAtCost),
                'unlinkedInvoices' => $row('Invoices not linked to a job (not in revenue)', $unlinkedBilled),
            ],
            'margins' => [
                'gross' => $revenue['total'] > 0 ? round($gross['total'] / $revenue['total'] * 100, 1) : 0,
                'net' => $revenue['total'] > 0 ? round($net['total'] / $revenue['total'] * 100, 1) : 0,
            ],
        ];
    }

    /**
     * Owed-to-owner position per property.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function owners(): Collection
    {
        $collected = RentCollection::query()->selectRaw('property_id, SUM(amount_collected) c, SUM(fee_amount) f, SUM(arrears) a')->groupBy('property_id')->get()->keyBy('property_id');
        $costs = PropertyExpense::query()->selectRaw('property_id, SUM(amount) s')->groupBy('property_id')->pluck('s', 'property_id');
        $paid = OwnerPayout::query()->selectRaw('property_id, SUM(amount) s')->groupBy('property_id')->pluck('s', 'property_id');

        return Property::query()->orderBy('name')->get()->map(function (Property $p) use ($collected, $costs, $paid): array {
            $c = (float) ($collected[$p->id]->c ?? 0);
            $f = (float) ($collected[$p->id]->f ?? 0);
            $e = (float) ($costs[$p->id] ?? 0);
            $o = (float) ($paid[$p->id] ?? 0);
            $net = $c - $f - $e;

            return [
                'id' => $p->id, 'name' => $p->name, 'owner_name' => $p->owner_name, 'owner_phone' => $p->owner_phone, 'status' => $p->status,
                'units' => (int) $p->units_count,
                'fee_type' => $p->management_fee_type ?: 'percent', 'fee_percent' => $p->management_fee_percent, 'fee_fixed' => $p->management_fee_fixed,
                'collected' => round($c, 2), 'fees' => round($f, 2), 'costs' => round($e, 2),
                'net_due' => round($net, 2), 'paid' => round($o, 2), 'balance' => round($net - $o, 2),
                'arrears' => round((float) ($collected[$p->id]->a ?? 0), 2),
            ];
        })->values();
    }

    /**
     * Dashboard numbers for the finance overview.
     *
     * @return array<string, mixed>
     */
    public function overview(int $year): array
    {
        $pl = $this->profitAndLoss($year);
        $invoices = Finance::query()->where('type', 'invoice')->whereIn('status', self::BILLED)->get();
        $today = now()->startOfDay();
        $aging = ['current' => 0.0, 'd1_30' => 0.0, 'd31_60' => 0.0, 'd60_plus' => 0.0];
        foreach ($invoices->where('balance', '>', 0) as $invoice) {
            $late = $invoice->due_date && $invoice->due_date->lt($today) ? $invoice->due_date->diffInDays($today) : 0;
            $bucket = $late === 0 ? 'current' : ($late <= 30 ? 'd1_30' : ($late <= 60 ? 'd31_60' : 'd60_plus'));
            $aging[$bucket] += (float) $invoice->balance;
        }

        $month = now();
        $ledger = new Ledger;
        $thisMonth = $ledger->totals($ledger->entries($month->copy()->startOfMonth(), $month->copy()->endOfMonth()));
        $owners = $this->owners();
        $jobs = $this->jobs();
        $monthIndex = $year === (int) $month->format('Y') ? (int) $month->format('n') : 12;
        $range = range(max(1, $monthIndex - 5), $monthIndex);

        return [
            'year' => $year,
            'kpis' => [
                'revenue' => $pl['revenue']['total']['total'],
                'netProfit' => $pl['netProfit']['total'],
                'netMargin' => $pl['margins']['net'],
                'grossProfit' => $pl['grossProfit']['total'],
                'managementFees' => $pl['revenue']['management']['total'],
                'maintenanceFees' => $pl['revenue']['maintenance']['total'],
                'operatingExpenses' => $pl['operating']['total']['total'],
                'commissions' => $pl['costOfServices']['commissions']['total'],
                'receivables' => round((float) $invoices->sum('balance'), 2),
                'overdue' => round((float) $invoices->where('balance', '>', 0)->filter(fn ($i) => $i->due_date && $i->due_date->lt($today))->sum('balance'), 2),
                'overdueCount' => $invoices->where('balance', '>', 0)->filter(fn ($i) => $i->due_date && $i->due_date->lt($today))->count(),
                'collectedThisMonth' => $thisMonth['cashIn'],
                'spentThisMonth' => $thisMonth['cashOut'],
                'netCashThisMonth' => $thisMonth['net'],
                'owedToOwners' => round((float) $owners->sum('balance'), 2),
                'commissionsDue' => round((float) TechnicianPayout::query()->where('status', 'pending')->sum('amount'), 2),
                'commissionsDueCount' => TechnicianPayout::query()->where('status', 'pending')->count(),
                'payrollDue' => round((float) PayrollEntry::query()->where('status', 'pending')->sum('net_pay'), 2),
                'payrollDueCount' => PayrollEntry::query()->where('status', 'pending')->count(),
            ],
            'trend' => array_map(fn (int $m) => [
                'month' => date('M', mktime(0, 0, 0, $m, 1)),
                'revenue' => $pl['revenue']['total']['months'][$m - 1],
                'expenses' => round($pl['costOfServices']['commissions']['months'][$m - 1] + $pl['operating']['total']['months'][$m - 1], 2),
                'profit' => $pl['netProfit']['months'][$m - 1],
            ], $range),
            'aging' => $aging,
            'revenueMix' => [
                ['label' => 'Maintenance fees', 'value' => $pl['revenue']['maintenance']['total']],
                ['label' => 'Management fees', 'value' => $pl['revenue']['management']['total']],
            ],
            'costMix' => array_values(array_filter([
                ['label' => 'Commissions', 'value' => $pl['costOfServices']['commissions']['total']],
                ['label' => 'Salaries', 'value' => $pl['operating']['payroll']['total']],
                ['label' => 'Operating expenses', 'value' => round(array_sum(array_column($pl['operating']['expenses'], 'total')), 2)],
            ], fn ($r) => $r['value'] > 0)),
            'topJobs' => $jobs->where('billed', '>', 0)->sortByDesc('net_margin')->take(5)->values(),
            'lossJobs' => $jobs->where('net_margin', '<', 0)->count(),
        ];
    }
}
