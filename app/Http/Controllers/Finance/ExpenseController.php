<?php

namespace App\Http\Controllers\Finance;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class ExpenseController extends ResourceController
{
    protected string $key = 'expenses';

    protected string $modelClass = Expense::class;

    protected string $label = 'Expense';

    protected string $dateColumn = 'expense_date';

    protected array $with = ['job:id,job_number,title'];

    protected ?array $number = ['EXP', 'expense_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'expense_date' => ['required', 'date'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:255'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
            'approved_by' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['paid', 'pending', 'cancelled'])],
            'job_id' => ['nullable', 'exists:service_jobs,id'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        $data['approved_by'] ??= $request->user()?->name;

        return $data;
    }

    protected function options(?Model $record = null): array
    {
        return ['categories' => config('finance.expense_categories'), 'methods' => config('finance.payment_methods'), 'jobs' => $this->jobOptions()];
    }

    protected function defaults(Request $request): array
    {
        return ['job_id' => $request->integer('job_id') ?: null];
    }

    protected function stats(Collection $records): array
    {
        $live = $records->where('status', '!=', 'cancelled');
        $byCategory = $live->groupBy('category')->map(fn ($rows, $category) => ['label' => $category, 'value' => round((float) $rows->sum('amount'), 2)])->sortByDesc('value')->values();

        return [
            'total' => round((float) $live->sum('amount'), 2),
            'thisMonth' => round((float) $live->filter(fn ($e) => $e->expense_date->isSameMonth(now()))->sum('amount'), 2),
            'pending' => round((float) $records->where('status', 'pending')->sum('amount'), 2),
            'pendingCount' => $records->where('status', 'pending')->count(),
            'count' => $live->count(),
            'jobLinked' => round((float) $live->whereNotNull('job_id')->sum('amount'), 2),
            'byCategory' => $byCategory,
        ];
    }
}
