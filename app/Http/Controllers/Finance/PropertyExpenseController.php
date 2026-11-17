<?php

namespace App\Http\Controllers\Finance;

use App\Models\Property;
use App\Models\PropertyExpense;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/** Costs paid on behalf of owners, at cost. These reduce the owner's balance. */
class PropertyExpenseController extends ResourceController
{
    protected string $key = 'property-expenses';

    protected string $modelClass = PropertyExpense::class;

    protected string $label = 'Owner expense';

    protected string $dateColumn = 'expense_date';

    protected array $with = ['property:id,name,owner_name', 'job:id,job_number,title'];

    protected ?array $number = ['OWX', 'expense_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'property_id' => ['required', 'exists:properties,id'],
            'expense_date' => ['required', 'date'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:255'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
            'job_id' => ['nullable', 'exists:service_jobs,id'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function options(?Model $record = null): array
    {
        return [
            'categories' => config('finance.owner_expense_categories'),
            'methods' => config('finance.payment_methods'),
            'properties' => Property::query()->orderBy('name')->get(['id', 'name', 'owner_name']),
            'jobs' => $this->jobOptions(),
        ];
    }

    protected function defaults(Request $request): array
    {
        return ['property_id' => $request->integer('property_id') ?: null, 'job_id' => $request->integer('job_id') ?: null];
    }

    protected function stats(Collection $records): array
    {
        return [
            'total' => round((float) $records->sum('amount'), 2),
            'thisMonth' => round((float) $records->filter(fn ($e) => $e->expense_date->isSameMonth(now()))->sum('amount'), 2),
            'count' => $records->count(),
            'properties' => $records->pluck('property_id')->unique()->count(),
            'byCategory' => $records->groupBy('category')->map(fn ($rows, $c) => ['label' => $c, 'value' => round((float) $rows->sum('amount'), 2)])->sortByDesc('value')->values(),
        ];
    }
}
