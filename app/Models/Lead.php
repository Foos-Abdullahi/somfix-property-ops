<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    protected $fillable = ['customer_id', 'property_id', 'unit_id', 'source', 'service_category', 'title', 'description', 'status', 'estimated_value', 'preferred_visit_date', 'notes'];
    protected function casts(): array { return ['estimated_value' => 'decimal:2', 'preferred_visit_date' => 'date']; }
    /** @return BelongsTo<Customer, $this> */ public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    /** @return BelongsTo<Property, $this> */ public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    /** @return BelongsTo<Unit, $this> */ public function unit(): BelongsTo { return $this->belongsTo(Unit::class); }
}
