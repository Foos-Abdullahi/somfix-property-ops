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
 * @property int|null $property_id
 * @property int|null $unit_id
 * @property int|null $tenant_id
 * @property string|null $recipient_name
 * @property string|null $recipient_email
 * @property string|null $notes
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

    protected $appends = ['line_items'];

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
     * Parse line items from description.
     *
     * @return array<int, array<string, string>>
     */
    public function getLineItemsAttribute(): array
    {
        $lines = explode("\n", (string) $this->description);
        $items = [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (str_starts_with($trimmed, '•')) {
                if (preg_match('/•\s*(.+?)\s*\(qty:\s*([\d.]+)\s*×\s*[A-Z]+\s*([\d.]+)\)/', $trimmed, $matches)) {
                    $items[] = [
                        'description' => trim($matches[1]),
                        'quantity' => $matches[2],
                        'unit_price' => $matches[3],
                        'amount' => number_format((float) $matches[2] * (float) $matches[3], 2, '.', ''),
                    ];
                    continue;
                }
                $items[] = [
                    'description' => trim(ltrim($trimmed, '• ')),
                    'quantity' => '1',
                    'unit_price' => (string) ($this->amount ?? '0.00'),
                    'amount' => (string) ($this->amount ?? '0.00'),
                ];
            }
        }

        if (empty($items)) {
            $items[] = [
                'description' => $this->description ?: ($this->title ?: 'Item'),
                'quantity' => '1',
                'unit_price' => (string) ($this->amount ?? '0.00'),
                'amount' => (string) ($this->amount ?? '0.00'),
            ];
        }

        return $items;
    }

    /**
     * Get the property associated with the finance record.
     */
    /** @return BelongsTo<Property, $this> */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the unit associated with the finance record.
     */
    /** @return BelongsTo<Unit, $this> */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the tenant associated with the finance record.
     */
    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
