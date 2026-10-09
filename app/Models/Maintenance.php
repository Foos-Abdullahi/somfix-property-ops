<?php

namespace App\Models;

use Database\Factories\MaintenanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $property_id
 * @property int|null $unit_id
 * @property int|null $tenant_id
 * @property string $category
 * @property string $priority
 * @property string $title
 * @property string $description
 * @property string $status
 * @property string|null $assigned_to
 * @property string|null $scheduled_date
 * @property string|null $completed_date
 * @property float|null $estimated_cost
 * @property float|null $actual_cost
 * @property string|null $notes
 */
#[Fillable([
    'property_id',
    'unit_id',
    'tenant_id',
    'category',
    'priority',
    'title',
    'description',
    'status',
    'assigned_to',
    'scheduled_date',
    'completed_date',
    'estimated_cost',
    'actual_cost',
    'notes',
])]
class Maintenance extends Model
{
    /** @use HasFactory<MaintenanceFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'completed_date' => 'date',
            'estimated_cost' => 'decimal:2',
            'actual_cost' => 'decimal:2',
        ];
    }

    /**
     * Get the property that owns the maintenance request.
     */
    /** @return BelongsTo<Property, $this> */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the unit that belongs to the maintenance request.
     */
    /** @return BelongsTo<Unit, $this> */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the tenant that belongs to the maintenance request.
     */
    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
