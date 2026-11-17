<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\FinanceSetting;
use App\Models\Property;
use App\Services\Finance\FinanceReport;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Money held for property owners: balances, fee terms and printable statements. */
class OwnerController extends Controller
{
    public function index(FinanceReport $report): Response
    {
        $owners = $report->owners();

        return Inertia::render('finance/owners/index', [
            'owners' => $owners,
            'defaults' => ['percent' => (float) FinanceSetting::get('mgmt_fee_percent'), 'fixed' => (float) FinanceSetting::get('mgmt_fee_fixed')],
            'stats' => [
                'collected' => round((float) $owners->sum('collected'), 2),
                'fees' => round((float) $owners->sum('fees'), 2),
                'costs' => round((float) $owners->sum('costs'), 2),
                'paid' => round((float) $owners->sum('paid'), 2),
                'owed' => round((float) $owners->sum('balance'), 2),
                'owedCount' => $owners->where('balance', '>', 0)->count(),
            ],
        ]);
    }

    public function show(Request $request, Property $owner, FinanceReport $report): Response
    {
        return Inertia::render('finance/owners/show', $this->statement($request, $owner, $report));
    }

    public function print(Request $request, Property $owner, FinanceReport $report): Response
    {
        return Inertia::render('finance/owners/statement', [...$this->statement($request, $owner, $report), 'company' => FinanceSetting::values()]);
    }

    public function update(Request $request, Property $owner): RedirectResponse
    {
        $data = $request->validate([
            'owner_phone' => ['nullable', 'string', 'max:50'],
            'management_fee_type' => ['required', Rule::in(['percent', 'fixed_per_unit'])],
            'management_fee_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'management_fee_fixed' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
        ]);
        $owner->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Management fee terms updated.']);

        return back();
    }

    /** @return array<string, mixed> */
    private function statement(Request $request, Property $owner, FinanceReport $report): array
    {
        $from = $request->date('from') ?? Carbon::now()->startOfYear();
        $to = $request->date('to') ?? Carbon::now()->endOfMonth();
        $between = fn ($q, $col) => $q->whereDate($col, '>=', $from)->whereDate($col, '<=', $to);

        $collections = $between($owner->rentCollections()->with('unit:id,unit_number'), 'received_date')->orderBy('received_date')->get();
        $expenses = $between($owner->propertyExpenses(), 'expense_date')->orderBy('expense_date')->get();
        $payouts = $between($owner->ownerPayouts(), 'payout_date')->orderBy('payout_date')->get();

        $totals = [
            'collected' => round((float) $collections->sum('amount_collected'), 2),
            'fees' => round((float) $collections->sum('fee_amount'), 2),
            'costs' => round((float) $expenses->sum('amount'), 2),
            'paid' => round((float) $payouts->sum('amount'), 2),
        ];
        $totals['netDue'] = round($totals['collected'] - $totals['fees'] - $totals['costs'], 2);
        $totals['periodBalance'] = round($totals['netDue'] - $totals['paid'], 2);

        return [
            'property' => $owner,
            'position' => $report->owners()->firstWhere('id', $owner->id),
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'collections' => $collections, 'expenses' => $expenses, 'payouts' => $payouts,
            'totals' => $totals,
            'defaults' => ['percent' => (float) FinanceSetting::get('mgmt_fee_percent'), 'fixed' => (float) FinanceSetting::get('mgmt_fee_fixed')],
        ];
    }
}
