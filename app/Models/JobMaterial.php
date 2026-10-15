<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobMaterial extends Model
{
    protected $fillable = ['job_id', 'inventory_id', 'quantity', 'unit_cost', 'selling_price', 'status', 'notes'];
    protected function casts(): array { return ['quantity' => 'decimal:2', 'unit_cost' => 'decimal:2', 'selling_price' => 'decimal:2']; }
    /** @return BelongsTo<Job, $this> */ public function job(): BelongsTo { return $this->belongsTo(Job::class); }
    /** @return BelongsTo<Inventory, $this> */ public function inventory(): BelongsTo { return $this->belongsTo(Inventory::class); }
}
