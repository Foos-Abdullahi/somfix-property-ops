<?php

namespace App\Models;

use Database\Factories\WorkOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $maintenance_id
 * @property int|null $service_team_id
 * @property string $title
 * @property string $description
 * @property string $status
 * @property string|null $assigned_date
 * @property string|null $started_date
 * @property string|null $completed_date
 * @property float|null $estimated_hours
 * @property float|null $actual_hours
 * @property string|null $notes
 */
#[Fillable([
    'maintenance_id',
    'service_team_id',
    'title',
    'description',
    'status',
    'assigned_date',
    'started_date',
    'completed_date',
    'estimated_hours',
    'actual_hours',
    'notes',
])]
class WorkOrder extends Model
{
    /** @use HasFactory<WorkOrderFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_date' => 'date',
            'started_date' => 'date',
            'completed_date' => 'date',
            'estimated_hours' => 'decimal:2',
            'actual_hours' => 'decimal:2',
        ];
    }

    /**
     * Get the maintenance request that owns the work order.
     */
    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(Maintenance::class);
    }

    /**
     * Get the service team member assigned to the work order.
     */
    public function serviceTeam(): BelongsTo
    {
        return $this->belongsTo(ServiceTeam::class);
    }
}
