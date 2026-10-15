<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobLabor extends Model
{
    protected $fillable = ['job_id', 'service_team_id', 'hours', 'cost_rate', 'selling_rate', 'work_date', 'notes'];
    protected function casts(): array { return ['hours' => 'decimal:2', 'cost_rate' => 'decimal:2', 'selling_rate' => 'decimal:2', 'work_date' => 'date']; }
    /** @return BelongsTo<Job, $this> */ public function job(): BelongsTo { return $this->belongsTo(Job::class); }
    /** @return BelongsTo<ServiceTeam, $this> */ public function serviceTeam(): BelongsTo { return $this->belongsTo(ServiceTeam::class); }
}
