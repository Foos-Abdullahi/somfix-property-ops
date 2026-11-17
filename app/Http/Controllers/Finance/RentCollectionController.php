<?php

namespace App\Http\Controllers\Finance;

use App\Models\Property;
use App\Models\RentCollection;
use App\Models\Tenant;
use App\Models\Unit;
use App\Services\Finance\FeeCalculator;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/** Rent received for owners. SOMFIX's management fee is calculated on every row. */
class RentCollectionController extends ResourceController
{
    protected string $key = 'rent';

    protected string $modelClass = RentCollection::class;

    protected string $label = 'Rent collection';

    protected string $dateColumn = 'received_date';

    protected array $with = ['property:id,name,owner_name', 'unit:id,unit_number', 'tenant:id,first_name,last_name'];

    protected ?array $number = ['RC', 'receipt_number'];

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'property_id' => ['required', 'exists:properties,id'],
            'unit_id' => ['nullable', 'exists:units,id', function ($attribute, $value, $fail) use ($request): void {
                if ($value && ! Unit::query()->whereKey($value)->where('property_id', $request->input('property_id'))->exists()) {
                    $fail('That unit does not belong to the selected property.');
                }
            }],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'tenant_name' => ['nullable', 'string', 'max:255'],
            'rent_month' => ['required', 'date'],
            'received_date' => ['required', 'date'],
            'rent_due' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'amount_collected' => ['required', 'numeric', 'gt:0', 'max:99999999'],
            'payment_method' => $this->methodRule(),
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        $property = Property::query()->findOrFail($data['property_id']);
        $collected = (float) $data['amount_collected'];
        $due = (float) ($data['rent_due'] ?? 0) ?: $collected;
        $fee = app(FeeCalculator::class)->rent($property, $collected);

        if (empty($data['tenant_name']) && ! empty($data['tenant_id'])) {
            $tenant = Tenant::query()->find($data['tenant_id']);
            $data['tenant_name'] = trim(($tenant?->first_name ?? '').' '.($tenant?->last_name ?? ''));
        }

        return [
            ...$data,
            'rent_month' => Carbon::parse($data['rent_month'])->startOfMonth()->toDateString(),
            'rent_due' => $due,
            'arrears' => round(max(0, $due - $collected), 2),
            'fee_type' => $fee['type'],
            'fee_amount' => $fee['fee'],
            'net_to_owner' => $fee['net'],
        ];
    }

    protected function options(?Model $record = null): array
    {
        $fees = app(FeeCalculator::class);
        $defaults = \App\Models\FinanceSetting::values();

        return [
            'methods' => config('finance.payment_methods'),
            'properties' => Property::query()->orderBy('name')->get()->map(fn (Property $p) => [
                'id' => $p->id, 'name' => $p->name, 'owner_name' => $p->owner_name,
                'fee_type' => $p->management_fee_type ?: 'percent',
                'fee_percent' => (float) ($p->management_fee_percent ?? $defaults['mgmt_fee_percent']),
                'fee_fixed' => (float) ($p->management_fee_fixed ?? $defaults['mgmt_fee_fixed']),
            ])->values(),
            'units' => Unit::query()->orderBy('unit_number')->get(['id', 'unit_number', 'property_id', 'monthly_rent']),
            'tenants' => Tenant::query()->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'unit_id']),
        ];
    }

    protected function defaults(Request $request): array
    {
        return ['property_id' => $request->integer('property_id') ?: null, 'received_date' => now()->toDateString(), 'rent_month' => now()->startOfMonth()->toDateString()];
    }

    protected function stats(Collection $records): array
    {
        $month = $records->filter(fn ($r) => $r->received_date->isSameMonth(now()));

        return [
            'collected' => round((float) $records->sum('amount_collected'), 2),
            'fees' => round((float) $records->sum('fee_amount'), 2),
            'netToOwners' => round((float) $records->sum('net_to_owner'), 2),
            'arrears' => round((float) $records->sum('arrears'), 2),
            'monthCollected' => round((float) $month->sum('amount_collected'), 2),
            'monthFees' => round((float) $month->sum('fee_amount'), 2),
            'count' => $records->count(),
        ];
    }
}
