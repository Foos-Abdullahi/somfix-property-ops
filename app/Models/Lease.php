<?php

namespace App\Models;

use Database\Factories\LeaseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $tenant_id
 * @property int $unit_id
 * @property string $start_date
 * @property string $end_date
 * @property float $monthly_rent
 * @property float $deposit_amount
 * @property string $status
 * @property int $payment_due_day
 * @property string $currency
 * @property string|null $notes
 */
#[Fillable([
    'tenant_id',
    'unit_id',
    'start_date',
    'end_date',
    'monthly_rent',
    'deposit_amount',
    'status',
    'payment_due_day',
    'currency',
    'notes',
])]
class Lease extends Model
{
    /** @use HasFactory<LeaseFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'monthly_rent' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'payment_due_day' => 'integer',
        ];
    }

    /**
     * Get the tenant that owns the lease.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the unit that belongs to the lease.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
