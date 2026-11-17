<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** SOMFIX's own operating cost (never an owner's cost). Optionally tied to a job. */
class Expense extends Model
{
    protected $fillable = ['expense_number', 'expense_date', 'category', 'description', 'vendor', 'amount', 'payment_method', 'reference', 'approved_by', 'status', 'job_id', 'notes'];

    protected function casts(): array
    {
        return ['expense_date' => 'date', 'amount' => 'decimal:2'];
    }

    /** @return BelongsTo<Job, $this> */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
