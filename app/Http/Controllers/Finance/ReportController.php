<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\FinanceReport;
use App\Services\Finance\ReportCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\CSV\Writer as CsvWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request, FinanceReport $report): Response
    {
        $year = $this->year($request);

        return Inertia::render('finance/reports/index', [
            'report' => $report->profitAndLoss($year),
            'years' => range((int) now()->format('Y') + 1, (int) now()->format('Y') - 5),
        ]);
    }

    /**
     * Download one report as CSV or Excel (.xlsx).
     */
    public function export(Request $request, ReportCatalog $catalog, string $report): StreamedResponse
    {
        $year = $this->year($request);
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';
        $data = $catalog->build($report, $year);
        $filename = 'somfix-'.str_replace('_', '-', $report).'-'.$year.'.'.$format;

        return response()->streamDownload(function () use ($data, $format, $year): void {
            $writer = $format === 'csv' ? new CsvWriter : new XlsxWriter;
            $writer->openToFile('php://output');

            $writer->addRow(Row::fromValues([$data['title'].' — '.$year]));
            $writer->addRow(Row::fromValues(['Generated '.now()->format('Y-m-d H:i')]));
            $writer->addRow(Row::fromValues([]));
            $writer->addRow(Row::fromValues(array_column($data['columns'], 'label')));

            foreach ($data['rows'] as $row) {
                $writer->addRow(Row::fromValues(array_map(function (array $c) use ($row) {
                    $v = $row[$c['key']] ?? null;
                    if ($c['type'] === 'money' || $c['type'] === 'percent' || $c['type'] === 'number') {
                        return $v === null ? null : (float) $v;
                    }

                    return $v === null ? '' : (string) $v;
                }, $data['columns'])));
            }

            if ($data['totals']) {
                $writer->addRow(Row::fromValues(array_map(
                    fn (array $c, int $i) => $i === 0 ? 'Total' : ($data['totals'][$c['key']] ?? ''),
                    $data['columns'],
                    array_keys($data['columns']),
                )));
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => $format === 'csv' ? 'text/csv; charset=UTF-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function year(Request $request): int
    {
        return min(max($request->integer('year') ?: (int) now()->format('Y'), 2000), 2100);
    }
}
