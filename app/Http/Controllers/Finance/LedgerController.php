<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\Ledger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LedgerController extends Controller
{
    public function index(Request $request, Ledger $ledger): mixed
    {
        $from = $request->date('from') ?? Carbon::now()->startOfMonth()->subMonths(2);
        $to = $request->date('to') ?? Carbon::now();
        $entries = $ledger->entries($from, $to);

        if ($request->query('export') === 'csv') {
            return response()->streamDownload(function () use ($entries): void {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['Date', 'Direction', 'Fund', 'Type', 'Description', 'Party', 'Job', 'Invoice', 'Property', 'Method', 'Reference', 'Amount']);
                foreach ($entries as $e) {
                    fputcsv($out, [$e['date'], $e['direction'], $e['fund'], $e['kind_label'], $e['title'], $e['party'], $e['job_number'], $e['invoice_number'], $e['property'], $e['method'], $e['reference'], number_format($e['amount'], 2, '.', '')]);
                }
                fclose($out);
            }, 'somfix-ledger-'.$from->toDateString().'-to-'.$to->toDateString().'.csv', ['Content-Type' => 'text/csv']);
        }

        return Inertia::render('finance/ledger/index', [
            'entries' => $entries,
            'totals' => $ledger->totals($entries),
            'kinds' => Ledger::KINDS,
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }
}
