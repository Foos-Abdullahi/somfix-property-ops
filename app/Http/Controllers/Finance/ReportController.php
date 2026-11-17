<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\FinanceReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request, FinanceReport $report): Response
    {
        $year = min(max($request->integer('year') ?: (int) now()->format('Y'), 2000), 2100);

        return Inertia::render('finance/reports/index', [
            'report' => $report->profitAndLoss($year),
            'years' => range((int) now()->format('Y') + 1, (int) now()->format('Y') - 5),
        ]);
    }
}
