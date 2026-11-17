<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Rent received on behalf of an owner. The owner's money; SOMFIX keeps only fee_amount. */
class RentCollection extends Model
{
    protected $fillable = ['receipt_number', 'property_id', 'unit_id', 'tenant_id', 'tenant_name', 'rent_month', 'received_date', 'rent_due', 'amount_collected', 'arrears', 'payment_method', 'reference', 'fee_type', 'fee_amount', 'net_to_owner', 'notes'];

    protected function casts(): array
    {
        return ['rent_month' => 'date', 'received_date' => 'date', 'rent_due' => 'decimal:2', 'amount_collected' => 'decimal:2', 'arrears' => 'decimal:2', 'fee_amount' => 'decimal:2', 'net_to_owner' => 'decimal:2'];
    }

    /** @return BelongsTo<Property, $this> */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /** @return BelongsTo<Unit, $this> */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
