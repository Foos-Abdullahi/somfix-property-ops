<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = ['payment_number', 'finance_id', 'amount', 'method', 'reference', 'paid_at', 'received_by', 'notes'];
    protected function casts(): array { return ['amount' => 'decimal:2', 'paid_at' => 'date']; }
    /** @return BelongsTo<Finance, $this> */ public function invoice(): BelongsTo { return $this->belongsTo(Finance::class, 'finance_id'); }
}
