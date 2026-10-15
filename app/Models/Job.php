<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    protected $table = 'service_jobs';
    protected $fillable = ['job_number', 'customer_id', 'lead_id', 'property_id', 'unit_id', 'title', 'scope', 'status', 'approved_value', 'approved_date', 'scheduled_date', 'completed_date', 'completion_notes'];
    protected function casts(): array { return ['approved_value' => 'decimal:2', 'approved_date' => 'date', 'scheduled_date' => 'date', 'completed_date' => 'date']; }
    /** @return BelongsTo<Customer, $this> */ public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    /** @return BelongsTo<Lead, $this> */ public function lead(): BelongsTo { return $this->belongsTo(Lead::class); }
    /** @return BelongsTo<Property, $this> */ public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    /** @return BelongsTo<Unit, $this> */ public function unit(): BelongsTo { return $this->belongsTo(Unit::class); }
    /** @return HasMany<JobMaterial, $this> */ public function materials(): HasMany { return $this->hasMany(JobMaterial::class); }
    /** @return HasMany<JobLabor, $this> */ public function labors(): HasMany { return $this->hasMany(JobLabor::class); }
    /** @return HasMany<Finance, $this> */ public function finances(): HasMany { return $this->hasMany(Finance::class); }
    /** @return HasMany<WorkOrder, $this> */ public function workOrders(): HasMany { return $this->hasMany(WorkOrder::class); }
}
