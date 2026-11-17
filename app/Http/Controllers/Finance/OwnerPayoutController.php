<?php

namespace App\Http\Controllers\Finance;

use App\Models\OwnerPayout;
use App\Models\Property;
use App\Services\Finance\FinanceReport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/** Rent money remitted to property owners. */
class OwnerPayoutController extends ResourceController
{
    protected string $key = 'owner-payouts';

    protected string $modelClass = OwnerPayout::class;

    protected string $label = 'Owner payout';

    protected string $dateColumn = 'payout_date';

    protected array $with = ['property:id,name,owner_name'];

    protected ?array $number = ['OPY', 'payout_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'property_id' => ['required', 'exists:properties,id'],
            'payout_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999', function ($attribute, $value, $fail) use ($request, $record): void {
                $owed = (float) (app(FinanceReport::class)->owners()->firstWhere('id', (int) $request->input('property_id'))['balance'] ?? 0);
                if ($record && (int) $record->property_id === (int) $request->input('property_id')) {
                    $owed += (float) $record->amount;
                }
                if ((float) $value > $owed + 0.001) {
                    $fail('This is more than the balance owed to the owner ($'.number_format(max(0, $owed), 2).').');
                }
            }],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function options(?Model $record = null): array
    {
        return [
            'methods' => config('finance.payment_methods'),
            'properties' => app(FinanceReport::class)->owners()->map(fn ($o) => ['id' => $o['id'], 'name' => $o['name'], 'owner_name' => $o['owner_name'], 'balance' => $o['balance']])->values(),
        ];
    }

    protected function defaults(Request $request): array
    {
        $property = $request->integer('property_id') ?: null;
        $balance = $property ? (app(FinanceReport::class)->owners()->firstWhere('id', $property)['balance'] ?? null) : null;

        return ['property_id' => $property, 'amount' => $balance && $balance > 0 ? $balance : null];
    }

    protected function stats(Collection $records): array
    {
        return [
            'total' => round((float) $records->sum('amount'), 2),
            'thisMonth' => round((float) $records->filter(fn ($p) => $p->payout_date->isSameMonth(now()))->sum('amount'), 2),
            'count' => $records->count(),
            'owedNow' => round((float) app(FinanceReport::class)->owners()->sum('balance'), 2),
        ];
    }
}
