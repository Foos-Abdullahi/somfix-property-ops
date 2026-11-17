<?php

namespace App\Http\Controllers\Finance;

use App\Models\PayrollEntry;
use App\Models\ServiceTeam;
use App\Services\Finance\Numbering;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/** Monthly salaries for in-house staff. */
class PayrollController extends ResourceController
{
    protected string $key = 'payroll';

    protected string $modelClass = PayrollEntry::class;

    protected string $label = 'Payroll entry';

    protected string $dateColumn = 'pay_month';

    protected array $with = ['serviceTeam:id,name,specialization,phone'];

    protected ?array $number = ['PAYR', 'payroll_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        $paid = $request->input('status') === 'paid';
        $month = $this->month($request->input('pay_month'));
        $money = ['nullable', 'numeric', 'min:0', 'max:99999999'];

        return [
            'service_team_id' => ['required', Rule::exists('service_teams', 'id')->where('staff_type', 'in_house'),
                function ($attribute, $value, $fail) use ($month, $record): void {
                    $taken = PayrollEntry::query()->where('service_team_id', $value)->whereDate('pay_month', $month)->when($record, fn ($q) => $q->whereKeyNot($record->id))->exists();
                    if ($taken) {
                        $fail('This employee already has a payroll line for that month.');
                    }
                }],
            'pay_month' => ['required', 'date'],
            'basic_salary' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'allowances' => $money, 'overtime' => $money, 'bonus' => $money,
            'advance_deduction' => $money, 'absence_deduction' => $money, 'other_deduction' => $money,
            'status' => ['required', Rule::in(['pending', 'paid'])],
            'paid_at' => [$paid ? 'required' : 'nullable', 'date'],
            'payment_method' => [$paid ? 'required' : 'nullable', 'in:'.implode(',', array_keys(config('finance.payment_methods')))],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        $data['pay_month'] = $this->month($data['pay_month']);
        foreach (['allowances', 'overtime', 'bonus', 'advance_deduction', 'absence_deduction', 'other_deduction'] as $field) {
            $data[$field] = (float) ($data[$field] ?? 0);
        }
        $data['gross_pay'] = round($data['basic_salary'] + $data['allowances'] + $data['overtime'] + $data['bonus'], 2);
        $data['total_deductions'] = round($data['advance_deduction'] + $data['absence_deduction'] + $data['other_deduction'], 2);
        $data['net_pay'] = round($data['gross_pay'] - $data['total_deductions'], 2);
        if ($data['net_pay'] < 0) {
            throw ValidationException::withMessages(['advance_deduction' => 'Deductions cannot be more than gross pay.']);
        }
        if ($data['status'] !== 'paid') {
            $data['paid_at'] = $data['payment_method'] = null;
        }

        return $data;
    }

    protected function options(?Model $record = null): array
    {
        return [
            'methods' => config('finance.payment_methods'),
            'staff' => ServiceTeam::query()->where('staff_type', 'in_house')->orderBy('name')->get(['id', 'name', 'specialization', 'status', 'monthly_salary', 'monthly_allowances']),
        ];
    }

    protected function defaults(Request $request): array
    {
        return ['pay_month' => now()->startOfMonth()->toDateString(), 'status' => 'pending'];
    }

    protected function stats(Collection $records): array
    {
        $thisMonth = $records->filter(fn ($p) => $p->pay_month->isSameMonth(now()));

        return [
            'monthGross' => round((float) $thisMonth->sum('gross_pay'), 2),
            'monthNet' => round((float) $thisMonth->sum('net_pay'), 2),
            'unpaid' => round((float) $records->where('status', 'pending')->sum('net_pay'), 2),
            'unpaidCount' => $records->where('status', 'pending')->count(),
            'paidYtd' => round((float) $records->where('status', 'paid')->filter(fn ($p) => $p->pay_month->isSameYear(now()))->sum('net_pay'), 2),
            'staff' => ServiceTeam::query()->where('staff_type', 'in_house')->where('status', 'active')->count(),
        ];
    }

    /** Create this month's payroll lines for every active in-house employee that has none yet. */
    public function generate(Request $request): RedirectResponse
    {
        $month = $this->month($request->validate(['pay_month' => ['required', 'date']])['pay_month']);
        $created = 0;
        foreach (ServiceTeam::query()->where('staff_type', 'in_house')->where('status', 'active')->get() as $staff) {
            if (PayrollEntry::query()->where('service_team_id', $staff->id)->whereDate('pay_month', $month)->exists()) {
                continue;
            }
            $basic = (float) $staff->monthly_salary;
            $allowances = (float) $staff->monthly_allowances;
            PayrollEntry::create([
                'payroll_number' => Numbering::next('PAYR', 'payroll_entries', 'payroll_number'), 'service_team_id' => $staff->id, 'pay_month' => $month,
                'basic_salary' => $basic, 'allowances' => $allowances, 'gross_pay' => $basic + $allowances, 'net_pay' => $basic + $allowances, 'status' => 'pending',
            ]);
            $created++;
        }
        Inertia::flash('toast', ['type' => $created ? 'success' : 'info', 'message' => $created ? "Payroll generated for {$created} employee(s)." : 'Payroll for this month already exists for every active employee.']);

        return back();
    }

    /** Mark a salary line as paid. */
    public function pay(Request $request, string $id): RedirectResponse
    {
        $entry = PayrollEntry::query()->findOrFail($id);
        $data = $request->validate([
            'paid_at' => ['required', 'date'],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
        ]);
        $entry->update([...$data, 'status' => 'paid']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Salary marked as paid.']);

        return back();
    }

    private function month(mixed $value): string
    {
        return Carbon::parse($value ?: now())->startOfMonth()->toDateString();
    }
}
