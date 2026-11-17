<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\RepairRequest;
use App\Services\Finance\FinanceReport;
use Inertia\Inertia;
use Inertia\Response;

/** Job profitability: what a job billed, collected, cost and left for SOMFIX. */
class JobFinanceController extends Controller
{
    public function index(FinanceReport $report): Response
    {
        $jobs = $report->jobs();
        $live = $jobs->where('billed', '>', 0);

        return Inertia::render('finance/jobs/index', [
            'jobs' => $jobs,
            'stats' => [
                'billed' => round((float) $jobs->sum('billed'), 2),
                'collected' => round((float) $jobs->sum('collected'), 2),
                'outstanding' => round((float) $jobs->sum('outstanding'), 2),
                'serviceFees' => round((float) $jobs->sum('service_fee'), 2),
                'commission' => round((float) $jobs->sum('commission'), 2),
                'netMargin' => round((float) $jobs->sum('net_margin'), 2),
                'marginPct' => $jobs->sum('billed') > 0 ? round($jobs->sum('net_margin') / $jobs->sum('billed') * 100, 1) : 0,
                'unbilled' => $jobs->where('billed', 0)->whereNotIn('status', ['cancelled'])->count(),
                'loss' => $live->where('net_margin', '<', 0)->count(),
            ],
        ]);
    }

    public function show(Job $job, FinanceReport $report): Response
    {
        $job->load(['customer', 'property', 'unit', 'materials.inventory', 'labors.serviceTeam', 'finances.payments', 'expenses', 'technicianPayouts.serviceTeam', 'workOrders.serviceTeam']);
        $request = $job->lead_id ? RepairRequest::query()->where('lead_id', $job->lead_id)->first(['id', 'name', 'service', 'created_at']) : null;

        return Inertia::render('finance/jobs/show', [
            'job' => $job,
            'summary' => $report->jobSummary($job),
            'request' => $request,
        ]);
    }
}
