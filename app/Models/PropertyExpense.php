<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A cost paid on behalf of an owner, at cost. Reduces what is owed to that owner. */
class PropertyExpense extends Model
{
    protected $fillable = ['expense_number', 'property_id', 'expense_date', 'category', 'description', 'vendor', 'amount', 'payment_method', 'reference', 'job_id', 'notes'];

    protected function casts(): array
    {
        return ['expense_date' => 'date', 'amount' => 'decimal:2'];
    }

    /** @return BelongsTo<Property, $this> */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /** @return BelongsTo<Job, $this> */
    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
