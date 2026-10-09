<?php

namespace App\Models;

use Database\Factories\FinanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $invoice_number
 * @property string $title
 * @property string $description
 * @property string $type
 * @property string $currency
 * @property string $amount
 * @property string $paid_amount
 * @property string $balance
 * @property string $due_date
 * @property string $paid_date
 * @property string $status
 * @property int|null property_id
 * @property int|null unit_id
 * @property int|null tenant_id
 * @property string|null recipient_name
 * @property string|null recipient_email
 * @property string|null notes
 */
#[Fillable([
    'invoice_number',
    'title',
    'description',
    'type',
    'currency',
    'amount',
    'paid_amount',
    'balance',
    'due_date',
    'paid_date',
    'status',
    'property_id',
    'unit_id',
    'tenant_id',
    'recipient_name',
    'recipient_email',
    'notes',
])]
class Finance extends Model
{
    /** @use HasFactory<FinanceFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance' => 'decimal:2',
            'due_date' => 'date',
            'paid_date' => 'date',
        ];
    }

    /**
     * Get the property associated with the finance record.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the unit associated with the finance record.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the tenant associated with the finance record.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
