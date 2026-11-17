<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Commission owed to (and later paid to) an external technician for a job. */
class TechnicianPayout extends Model
{
    protected $fillable = ['payout_number', 'service_team_id', 'job_id', 'earned_date', 'base_amount', 'percent', 'amount', 'status', 'paid_at', 'payment_method', 'reference', 'notes'];

    protected function casts(): array
    {
        return ['earned_date' => 'date', 'paid_at' => 'date', 'base_amount' => 'decimal:2', 'percent' => 'decimal:2', 'amount' => 'decimal:2'];
    }

    /** @return BelongsTo<ServiceTeam, $this> */
    public function serviceTeam(): BelongsTo
    {
        return $this->belongsTo(ServiceTeam::class);
    }

    /** @return BelongsTo<Job, $this> */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
