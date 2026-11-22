<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\Finance;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\PayrollEntry;
use App\Models\PropertyExpense;
use App\Models\RentCollection;
use App\Models\TechnicianPayout;
use Illuminate\Support\Collection;

/**
 * Every finance report as a flat, exportable table: one definition feeds the
 * on-screen report, the printout and the CSV / Excel downloads.
 *
 * Column types: text, date, month, money, percent, number.
 */
class ReportCatalog
{
    private const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    public function __construct(private readonly FinanceReport $finance, private readonly Ledger $ledger) {}

    /** @return array<string, array{title: string, group: string, description: string}> */
    public function definitions(): array
    {
        return [
            'profit_loss' => ['title' => 'Profit & Loss', 'group' => 'Summary', 'description' => 'Monthly income statement. Client funds are memo lines, never SOMFIX income.'],
            'job_profitability' => ['title' => 'Job profitability', 'group' => 'Summary', 'description' => 'Billed, collected and net margin for every job.'],
            'invoices' => ['title' => 'Invoices', 'group' => 'Sales', 'description' => 'Every invoice issued in the year with paid and outstanding amounts.'],
            'quotations' => ['title' => 'Quotations', 'group' => 'Sales', 'description' => 'Quotations created in the year and their status.'],
            'receivables' => ['title' => 'Receivables aging', 'group' => 'Sales', 'description' => 'Unpaid invoices today, grouped by how late they are.'],
            'customer_payments' => ['title' => 'Customer payments', 'group' => 'Money in', 'description' => 'Payments received against invoices.'],
            'rent' => ['title' => 'Rent collections', 'group' => 'Money in', 'description' => 'Rent received for property owners with management fee and net due.'],
            'expenses' => ['title' => 'Expenses', 'group' => 'Money out', 'description' => 'Company expenses with category, vendor and status.'],
            'expenses_by_category' => ['title' => 'Expenses by category', 'group' => 'Money out', 'description' => 'Paid and unpaid company expenses grouped by category.'],
            'commissions' => ['title' => 'Technician commissions', 'group' => 'Payouts', 'description' => 'Commission earned per job, paid and pending.'],
            'payroll' => ['title' => 'Payroll', 'group' => 'Payouts', 'description' => 'Monthly salary lines with deductions and net pay.'],
            'owner_statements' => ['title' => 'Owner statements', 'group' => 'Owners', 'description' => 'Rent collected, fees, costs, payouts and balance held per property.'],
            'owner_expenses' => ['title' => 'Owner expenses', 'group' => 'Owners', 'description' => 'Costs paid on behalf of property owners, at cost.'],
            'owner_payouts' => ['title' => 'Owner payouts', 'group' => 'Owners', 'description' => 'Money remitted to property owners.'],
            'cash_ledger' => ['title' => 'Cash ledger', 'group' => 'Accounting', 'description' => 'Every cash movement in and out, company and client funds.'],
        ];
    }

    /** @return array<string, mixed> */
    public function build(string $key, int $year): array
    {
        $definition = $this->definitions()[$key] ?? abort(404);
        [$columns, $rows] = match ($key) {
            'profit_loss' => $this->profitLoss($year),
            'job_profitability' => $this->jobProfitability($year),
            'invoices' => $this->invoices($year),
            'quotations' => $this->quotations($year),
            'receivables' => $this->receivables(),
            'customer_payments' => $this->customerPayments($year),
            'rent' => $this->rent($year),
            'expenses' => $this->expenses($year),
            'expenses_by_category' => $this->expensesByCategory($year),
            'commissions' => $this->commissions($year),
            'payroll' => $this->payroll($year),
            'owner_statements' => $this->ownerStatements(),
            'owner_expenses' => $this->ownerExpenses($year),
            'owner_payouts' => $this->ownerPayouts($year),
            'cash_ledger' => $this->cashLedger($year),
        };

        $totals = [];
        foreach ($columns as $column) {
            if ($column['type'] === 'money' && ($column['total'] ?? true)) {
                $totals[$column['key']] = round((float) collect($rows)->sum(fn (array $r) => (float) ($r[$column['key']] ?? 0)), 2);
            }
        }

        return [
            'key' => $key, ...$definition, 'year' => $year,
            'columns' => $columns, 'rows' => array_values($rows), 'totals' => $totals,
        ];
    }

    /** @return array<string, array<string, mixed>> */
    public function all(int $year): array
    {
        $all = [];
        foreach (array_keys($this->definitions()) as $key) {
            $all[$key] = $this->build($key, $year);
        }

        return $all;
    }

    private function col(string $key, string $label, string $type = 'text', bool $total = true): array
    {
        return ['key' => $key, 'label' => $label, 'type' => $type, 'total' => $total];
    }

    /** @return array{0: list<array<string, mixed>>, 1: list<array<string, mixed>>} */
    private function profitLoss(int $year): array
    {
        $pl = $this->finance->profitAndLoss($year);
        $columns = [$this->col('line', 'USD', 'text')];
        foreach (self::MONTHS as $i => $m) {
            $columns[] = $this->col('m'.$i, $m, 'money', false);
        }
        $columns[] = $this->col('total', 'Full year', 'money', false);

        $rows = [];
        $line = function (string $section, array $l) use (&$rows): void {
            $row = ['line' => $l['label'], 'section' => $section, 'total' => $l['total']];
            foreach ($l['months'] as $i => $v) {
                $row['m'.$i] = $v;
            }
            $rows[] = $row;
        };
        $line('Revenue', $pl['revenue']['management']);
        $line('Revenue', $pl['revenue']['maintenance']);
        $line('Revenue', ['label' => 'Total revenue'] + $pl['revenue']['total']);
        $line('Cost of services', $pl['costOfServices']['commissions']);
        $line('Cost of services', ['label' => 'Gross profit'] + $pl['grossProfit']);
        $line('Operating expenses', $pl['operating']['payroll']);
        foreach ($pl['operating']['expenses'] as $l) {
            $line('Operating expenses', $l);
        }
        $line('Operating expenses', ['label' => 'Total operating expenses'] + $pl['operating']['total']);
        $line('Result', ['label' => 'Net profit'] + $pl['netProfit']);
        foreach ($pl['memo'] as $l) {
            $line('Memo (client funds, not income)', $l);
        }

        return [$columns, $rows];
    }

    private function jobProfitability(int $year): array
    {
        $jobs = $this->finance->jobs()->filter(fn (array $j) => str_starts_with((string) $j['date'], (string) $year));
        $columns = [
            $this->col('job_number', 'Job'), $this->col('title', 'Title'), $this->col('customer', 'Customer'), $this->col('status', 'Status'),
            $this->col('date', 'Date', 'date'), $this->col('billed', 'Billed', 'money'), $this->col('collected', 'Collected', 'money'),
            $this->col('outstanding', 'Outstanding', 'money'), $this->col('materials_cost', 'Materials', 'money'), $this->col('service_fee', 'Service fee', 'money'),
            $this->col('commission', 'Commission', 'money'), $this->col('direct_expenses', 'Expenses', 'money'), $this->col('net_margin', 'Net margin', 'money'),
            $this->col('margin_pct', 'Margin %', 'percent'),
        ];

        return [$columns, $jobs->values()->all()];
    }

    private function invoices(int $year): array
    {
        $rows = Finance::query()->where('type', 'invoice')->whereYear('created_at', $year)->with('job.customer')->orderBy('created_at')->get()
            ->map(fn (Finance $f) => [
                'number' => $f->invoice_number, 'date' => $f->created_at?->toDateString(), 'recipient' => $f->recipient_name ?: $f->job?->customer?->name,
                'title' => $f->title, 'job' => $f->job?->job_number, 'due_date' => $f->due_date?->toDateString(), 'status' => $this->label($f->status),
                'amount' => (float) $f->amount, 'paid' => (float) $f->paid_amount, 'balance' => (float) $f->balance,
            ]);

        return [[
            $this->col('number', 'Invoice'), $this->col('date', 'Issued', 'date'), $this->col('recipient', 'Customer'), $this->col('title', 'Description'),
            $this->col('job', 'Job'), $this->col('due_date', 'Due', 'date'), $this->col('status', 'Status'),
            $this->col('amount', 'Amount', 'money'), $this->col('paid', 'Paid', 'money'), $this->col('balance', 'Balance', 'money'),
        ], $rows->all()];
    }

    private function quotations(int $year): array
    {
        $rows = Finance::query()->where('type', 'quote')->whereYear('created_at', $year)->orderBy('created_at')->get()
            ->map(fn (Finance $f) => [
                'number' => $f->invoice_number, 'date' => $f->created_at?->toDateString(), 'recipient' => $f->recipient_name,
                'title' => $f->title, 'status' => $this->label($f->status), 'amount' => (float) $f->amount,
            ]);

        return [[
            $this->col('number', 'Quotation'), $this->col('date', 'Created', 'date'), $this->col('recipient', 'Customer'),
            $this->col('title', 'Description'), $this->col('status', 'Status'), $this->col('amount', 'Amount', 'money'),
        ], $rows->all()];
    }

    private function receivables(): array
    {
        $today = now()->startOfDay();
        $rows = Finance::query()->where('type', 'invoice')->whereIn('status', FinanceReport::BILLED)->where('balance', '>', 0)->with('job.customer')->orderBy('due_date')->get()
            ->map(function (Finance $f) use ($today): array {
                $late = $f->due_date && $f->due_date->lt($today) ? (int) $f->due_date->diffInDays($today) : 0;

                return [
                    'number' => $f->invoice_number, 'recipient' => $f->recipient_name ?: $f->job?->customer?->name, 'job' => $f->job?->job_number,
                    'due_date' => $f->due_date?->toDateString(), 'days_late' => $late,
                    'bucket' => $late === 0 ? 'Current' : ($late <= 30 ? '1-30 days' : ($late <= 60 ? '31-60 days' : '60+ days')),
                    'amount' => (float) $f->amount, 'paid' => (float) $f->paid_amount, 'balance' => (float) $f->balance,
                ];
            });

        return [[
            $this->col('number', 'Invoice'), $this->col('recipient', 'Customer'), $this->col('job', 'Job'), $this->col('due_date', 'Due', 'date'),
            $this->col('days_late', 'Days late', 'number'), $this->col('bucket', 'Aging'), $this->col('amount', 'Amount', 'money'),
            $this->col('paid', 'Paid', 'money'), $this->col('balance', 'Balance', 'money'),
        ], $rows->all()];
    }

    private function customerPayments(int $year): array
    {
        $rows = Payment::query()->whereYear('paid_at', $year)->with('invoice.job.customer')->orderBy('paid_at')->get()
            ->map(fn (Payment $p) => [
                'number' => $p->payment_number, 'date' => $p->paid_at?->toDateString(), 'invoice' => $p->invoice?->invoice_number,
                'customer' => $p->invoice?->job?->customer?->name ?: $p->invoice?->recipient_name, 'method' => $this->label($p->method),
                'reference' => $p->reference, 'amount' => (float) $p->amount,
            ]);

        return [[
            $this->col('number', 'Payment'), $this->col('date', 'Date', 'date'), $this->col('invoice', 'Invoice'), $this->col('customer', 'Customer'),
            $this->col('method', 'Method'), $this->col('reference', 'Reference'), $this->col('amount', 'Amount', 'money'),
        ], $rows->all()];
    }

    private function rent(int $year): array
    {
        $rows = RentCollection::query()->whereYear('received_date', $year)->with('property')->orderBy('received_date')->get()
            ->map(fn (RentCollection $r) => [
                'number' => $r->receipt_number, 'date' => $r->received_date?->toDateString(), 'month' => $r->rent_month?->format('M Y'),
                'property' => $r->property?->name, 'tenant' => $r->tenant_name, 'method' => $this->label($r->payment_method),
                'rent_due' => (float) $r->rent_due, 'amount_collected' => (float) $r->amount_collected, 'arrears' => (float) $r->arrears,
                'fee_amount' => (float) $r->fee_amount, 'net_to_owner' => (float) $r->net_to_owner,
            ]);

        return [[
            $this->col('number', 'Receipt'), $this->col('date', 'Received', 'date'), $this->col('month', 'Rent month'), $this->col('property', 'Property'),
            $this->col('tenant', 'Tenant'), $this->col('method', 'Method'), $this->col('rent_due', 'Rent due', 'money'),
            $this->col('amount_collected', 'Collected', 'money'), $this->col('arrears', 'Arrears', 'money'),
            $this->col('fee_amount', 'Mgmt fee', 'money'), $this->col('net_to_owner', 'Net to owner', 'money'),
        ], $rows->all()];
    }

    private function expenses(int $year): array
    {
        $rows = Expense::query()->whereYear('expense_date', $year)->with('job')->orderBy('expense_date')->get()
            ->map(fn (Expense $e) => [
                'number' => $e->expense_number, 'date' => $e->expense_date?->toDateString(), 'category' => $this->label($e->category),
                'description' => $e->description, 'vendor' => $e->vendor, 'job' => $e->job?->job_number, 'method' => $this->label($e->payment_method),
                'status' => $this->label($e->status), 'amount' => (float) $e->amount,
            ]);

        return [[
            $this->col('number', 'Expense'), $this->col('date', 'Date', 'date'), $this->col('category', 'Category'), $this->col('description', 'Description'),
            $this->col('vendor', 'Vendor'), $this->col('job', 'Job'), $this->col('method', 'Method'), $this->col('status', 'Status'),
            $this->col('amount', 'Amount', 'money'),
        ], $rows->all()];
    }

    private function expensesByCategory(int $year): array
    {
        $rows = Expense::query()->whereYear('expense_date', $year)->where('status', '!=', 'cancelled')->get()->groupBy('category')
            ->map(fn (Collection $g, $category) => [
                'category' => $this->label((string) $category), 'count' => $g->count(),
                'paid' => (float) $g->where('status', 'paid')->sum('amount'), 'unpaid' => (float) $g->where('status', '!=', 'paid')->sum('amount'),
                'total' => (float) $g->sum('amount'),
            ])->sortByDesc('total');

        return [[
            $this->col('category', 'Category'), $this->col('count', 'Entries', 'number'), $this->col('paid', 'Paid', 'money'),
            $this->col('unpaid', 'Unpaid', 'money'), $this->col('total', 'Total', 'money'),
        ], $rows->all()];
    }

    private function commissions(int $year): array
    {
        $rows = TechnicianPayout::query()->whereYear('earned_date', $year)->with(['serviceTeam', 'job'])->orderBy('earned_date')->get()
            ->map(fn (TechnicianPayout $t) => [
                'number' => $t->payout_number, 'date' => $t->earned_date?->toDateString(), 'technician' => $t->serviceTeam?->name, 'job' => $t->job?->job_number,
                'base_amount' => (float) $t->base_amount, 'percent' => (float) $t->percent, 'amount' => (float) $t->amount,
                'status' => $this->label($t->status), 'paid_at' => $t->paid_at?->toDateString(),
            ]);

        return [[
            $this->col('number', 'Commission'), $this->col('date', 'Earned', 'date'), $this->col('technician', 'Technician'), $this->col('job', 'Job'),
            $this->col('base_amount', 'Base', 'money'), $this->col('percent', 'Rate %', 'percent'), $this->col('amount', 'Commission', 'money'),
            $this->col('status', 'Status'), $this->col('paid_at', 'Paid on', 'date'),
        ], $rows->all()];
    }

    private function payroll(int $year): array
    {
        $rows = PayrollEntry::query()->whereYear('pay_month', $year)->with('serviceTeam')->orderBy('pay_month')->get()
            ->map(fn (PayrollEntry $p) => [
                'number' => $p->payroll_number, 'month' => $p->pay_month?->format('M Y'), 'employee' => $p->serviceTeam?->name,
                'basic_salary' => (float) $p->basic_salary, 'allowances' => (float) $p->allowances, 'overtime' => (float) $p->overtime, 'bonus' => (float) $p->bonus,
                'gross_pay' => (float) $p->gross_pay, 'total_deductions' => (float) $p->total_deductions, 'net_pay' => (float) $p->net_pay,
                'status' => $this->label($p->status), 'paid_at' => $p->paid_at?->toDateString(),
            ]);

        return [[
            $this->col('number', 'Payroll'), $this->col('month', 'Month'), $this->col('employee', 'Employee'), $this->col('basic_salary', 'Basic', 'money'),
            $this->col('allowances', 'Allowances', 'money'), $this->col('overtime', 'Overtime', 'money'), $this->col('bonus', 'Bonus', 'money'),
            $this->col('gross_pay', 'Gross', 'money'), $this->col('total_deductions', 'Deductions', 'money'), $this->col('net_pay', 'Net pay', 'money'),
            $this->col('status', 'Status'), $this->col('paid_at', 'Paid on', 'date'),
        ], $rows->all()];
    }

    private function ownerStatements(): array
    {
        $rows = $this->finance->owners()->map(fn (array $o) => [
            'property' => $o['name'], 'owner' => $o['owner_name'], 'phone' => $o['owner_phone'], 'units' => $o['units'],
            'collected' => $o['collected'], 'fees' => $o['fees'], 'costs' => $o['costs'], 'net_due' => $o['net_due'],
            'paid' => $o['paid'], 'balance' => $o['balance'], 'arrears' => $o['arrears'],
        ]);

        return [[
            $this->col('property', 'Property'), $this->col('owner', 'Owner'), $this->col('phone', 'Phone'), $this->col('units', 'Units', 'number'),
            $this->col('collected', 'Rent collected', 'money'), $this->col('fees', 'Mgmt fees', 'money'), $this->col('costs', 'Owner costs', 'money'),
            $this->col('net_due', 'Net due', 'money'), $this->col('paid', 'Paid out', 'money'), $this->col('balance', 'Balance held', 'money'),
            $this->col('arrears', 'Arrears', 'money'),
        ], $rows->all()];
    }

    private function ownerExpenses(int $year): array
    {
        $rows = PropertyExpense::query()->whereYear('expense_date', $year)->with(['property', 'job'])->orderBy('expense_date')->get()
            ->map(fn (PropertyExpense $e) => [
                'number' => $e->expense_number, 'date' => $e->expense_date?->toDateString(), 'property' => $e->property?->name,
                'category' => $this->label($e->category), 'description' => $e->description, 'vendor' => $e->vendor, 'job' => $e->job?->job_number,
                'amount' => (float) $e->amount,
            ]);

        return [[
            $this->col('number', 'Expense'), $this->col('date', 'Date', 'date'), $this->col('property', 'Property'), $this->col('category', 'Category'),
            $this->col('description', 'Description'), $this->col('vendor', 'Vendor'), $this->col('job', 'Job'), $this->col('amount', 'Amount', 'money'),
        ], $rows->all()];
    }

    private function ownerPayouts(int $year): array
    {
        $rows = OwnerPayout::query()->whereYear('payout_date', $year)->with('property')->orderBy('payout_date')->get()
            ->map(fn (OwnerPayout $o) => [
                'number' => $o->payout_number, 'date' => $o->payout_date?->toDateString(), 'property' => $o->property?->name, 'owner' => $o->property?->owner_name,
                'method' => $this->label($o->payment_method), 'reference' => $o->reference, 'amount' => (float) $o->amount,
            ]);

        return [[
            $this->col('number', 'Payout'), $this->col('date', 'Date', 'date'), $this->col('property', 'Property'), $this->col('owner', 'Owner'),
            $this->col('method', 'Method'), $this->col('reference', 'Reference'), $this->col('amount', 'Amount', 'money'),
        ], $rows->all()];
    }

    private function cashLedger(int $year): array
    {
        $entries = $this->ledger->entries(now()->setDate($year, 1, 1)->startOfDay(), now()->setDate($year, 12, 31)->endOfDay())
            ->sortBy('date')->map(fn (array $e) => [
                'date' => $e['date'], 'direction' => $e['direction'] === 'in' ? 'Money in' : 'Money out', 'fund' => $e['fund'] === 'client' ? 'Owner funds' : 'Company',
                'type' => $e['kind_label'], 'title' => $e['title'], 'party' => $e['party'], 'job' => $e['job_number'], 'property' => $e['property'],
                'method' => $this->label($e['method']),
                'in' => $e['direction'] === 'in' ? $e['amount'] : 0.0, 'out' => $e['direction'] === 'out' ? $e['amount'] : 0.0,
            ]);

        return [[
            $this->col('date', 'Date', 'date'), $this->col('direction', 'Direction'), $this->col('fund', 'Fund'), $this->col('type', 'Type'),
            $this->col('title', 'Description'), $this->col('party', 'Party'), $this->col('job', 'Job'), $this->col('property', 'Property'),
            $this->col('method', 'Method'), $this->col('in', 'Money in', 'money'), $this->col('out', 'Money out', 'money'),
        ], $entries->values()->all()];
    }

    private function label(?string $value): ?string
    {
        return $value === null || $value === '' ? null : ucwords(str_replace(['_', '-'], ' ', $value));
    }
}
