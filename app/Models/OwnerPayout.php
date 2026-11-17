<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwnerPayout extends Model
{
    protected $fillable = ['payout_number', 'property_id', 'payout_date', 'amount', 'payment_method', 'reference', 'notes'];

    protected function casts(): array
    {
        return ['payout_date' => 'date', 'amount' => 'decimal:2'];
    }

    /** @return BelongsTo<Property, $this> */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
