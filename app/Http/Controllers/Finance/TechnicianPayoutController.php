<?php

namespace App\Http\Controllers\Finance;

use App\Models\ServiceTeam;
use App\Models\TechnicianPayout;
use App\Services\Finance\FeeCalculator;
use App\Services\Finance\FinanceReport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/** Commission owed to external technicians for the jobs they complete. */
class TechnicianPayoutController extends ResourceController
{
    protected string $key = 'commissions';

    protected string $modelClass = TechnicianPayout::class;

    protected string $label = 'Commission';

    protected string $dateColumn = 'earned_date';

    protected array $with = ['serviceTeam:id,name,specialization,phone', 'job:id,job_number,title'];

    protected ?array $number = ['COM', 'payout_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        $paid = $request->input('status') === 'paid';

        return [
            'service_team_id' => ['required', Rule::exists('service_teams', 'id')->where('staff_type', 'external')],
            'job_id' => ['nullable', 'exists:service_jobs,id'],
            'earned_date' => ['required', 'date'],
            'base_amount' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'status' => ['required', Rule::in(['pending', 'paid', 'cancelled'])],
            'paid_at' => [$paid ? 'required' : 'nullable', 'date'],
            'payment_method' => [$paid ? 'required' : 'nullable', 'in:'.implode(',', array_keys(config('finance.payment_methods')))],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        $data['amount'] = app(FeeCalculator::class)->commission((float) $data['base_amount'], (float) $data['percent']);
        if ($data['status'] !== 'paid') {
            $data['paid_at'] = $data['payment_method'] = null;
        }

        return $data;
    }

    protected function options(?Model $record = null): array
    {
        $fees = app(FeeCalculator::class);

        return [
            'methods' => config('finance.payment_methods'),
            'technicians' => ServiceTeam::query()->where('staff_type', 'external')->orderBy('name')->get(['id', 'name', 'specialization', 'status', 'commission_percent'])
                ->map(fn ($t) => [...$t->toArray(), 'effective_percent' => $fees->commissionPercent($t)])->values(),
            'jobs' => app(FinanceReport::class)->jobs()->map(fn ($j) => Arr::only($j, ['id', 'job_number', 'title', 'customer', 'billed', 'collected', 'service_fee', 'commission']))->values(),
        ];
    }

    protected function defaults(Request $request): array
    {
        $out = ['earned_date' => now()->toDateString(), 'status' => 'pending', 'service_team_id' => $request->integer('service_team_id') ?: null];
        if ($jobId = $request->integer('job_id')) {
            $job = \App\Models\Job::query()->find($jobId);
            if ($job) {
                $summary = app(FinanceReport::class)->jobSummary($job->load(['materials', 'finances.payments', 'expenses', 'technicianPayouts']));
                $out += ['job_id' => $job->id, 'base_amount' => max(0, $summary['service_fee'])];
            }
        }

        return $out;
    }

    protected function detail(Model $record): array
    {
        $job = $record->job ? app(FinanceReport::class)->jobSummary($record->job->load(['materials', 'finances.payments', 'expenses', 'technicianPayouts', 'customer'])) : null;

        return ['job' => $job];
    }

    protected function stats(Collection $records): array
    {
        $live = $records->where('status', '!=', 'cancelled');

        return [
            'earned' => round((float) $live->sum('amount'), 2),
            'pending' => round((float) $records->where('status', 'pending')->sum('amount'), 2),
            'pendingCount' => $records->where('status', 'pending')->count(),
            'paid' => round((float) $records->where('status', 'paid')->sum('amount'), 2),
            'technicians' => $live->pluck('service_team_id')->unique()->count(),
            'byTechnician' => $live->groupBy('service_team_id')->map(fn ($rows) => ['label' => $rows->first()->serviceTeam?->name ?? 'Unknown', 'value' => round((float) $rows->sum('amount'), 2)])->sortByDesc('value')->values()->take(6),
        ];
    }

    /** Mark a commission as paid. */
    public function pay(Request $request, string $id): RedirectResponse
    {
        $payout = TechnicianPayout::query()->findOrFail($id);
        abort_if($payout->status === 'cancelled', 422, 'A cancelled commission cannot be paid.');
        $data = $request->validate([
            'paid_at' => ['required', 'date'],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
        ]);
        $payout->update([...$data, 'status' => 'paid']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Commission marked as paid.']);

        return back();
    }
}
