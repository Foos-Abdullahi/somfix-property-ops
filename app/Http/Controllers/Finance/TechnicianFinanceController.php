<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PayrollEntry;
use App\Models\ServiceTeam;
use App\Models\TechnicianPayout;
use App\Services\Finance\FeeCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Pay profile and earnings of every technician and employee. */
class TechnicianFinanceController extends Controller
{
    public function index(FeeCalculator $fees): Response
    {
        $payouts = TechnicianPayout::query()->where('status', '!=', 'cancelled')->get()->groupBy('service_team_id');
        $payroll = PayrollEntry::query()->get()->groupBy('service_team_id');

        $team = ServiceTeam::query()->orderBy('name')->get()->map(function (ServiceTeam $t) use ($payouts, $payroll, $fees): array {
            $p = $payouts->get($t->id, collect());
            $s = $payroll->get($t->id, collect());

            return [
                ...$t->only(['id', 'name', 'specialization', 'phone', 'status', 'staff_type', 'commission_percent', 'monthly_salary', 'monthly_allowances']),
                'effective_percent' => $fees->commissionPercent($t),
                'jobs' => $p->whereNotNull('job_id')->pluck('job_id')->unique()->count(),
                'earned' => round((float) $p->sum('amount') + (float) $s->sum('net_pay'), 2),
                'commission_pending' => round((float) $p->where('status', 'pending')->sum('amount'), 2),
                'salary_pending' => round((float) $s->where('status', 'pending')->sum('net_pay'), 2),
                'paid' => round((float) $p->where('status', 'paid')->sum('amount') + (float) $s->where('status', 'paid')->sum('net_pay'), 2),
            ];
        });

        return Inertia::render('finance/technicians/index', [
            'team' => $team,
            'defaults' => ['percent' => (float) \App\Models\FinanceSetting::get('technician_commission_percent')],
            'stats' => [
                'external' => $team->where('staff_type', 'external')->count(),
                'inHouse' => $team->where('staff_type', 'in_house')->count(),
                'pending' => round((float) $team->sum('commission_pending') + (float) $team->sum('salary_pending'), 2),
                'paid' => round((float) $team->sum('paid'), 2),
            ],
        ]);
    }

    public function show(ServiceTeam $technician): Response
    {
        return Inertia::render('finance/technicians/show', [
            'technician' => $technician,
            'effectivePercent' => app(FeeCalculator::class)->commissionPercent($technician),
            'commissions' => $technician->technicianPayouts()->with('job:id,job_number,title')->orderByDesc('earned_date')->get(),
            'payroll' => $technician->payrollEntries()->orderByDesc('pay_month')->get(),
            'methods' => config('finance.payment_methods'),
        ]);
    }

    public function update(Request $request, ServiceTeam $technician): RedirectResponse
    {
        $data = $request->validate([
            'staff_type' => ['required', Rule::in(['in_house', 'external'])],
            'commission_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'monthly_salary' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'monthly_allowances' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
        ]);
        $technician->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pay profile updated.']);

        return back();
    }
}
