<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemoRequest extends Model
{
    protected $fillable = ['name', 'email', 'company', 'team_size', 'message', 'status', 'follow_up_at', 'walkthrough_at', 'notes', 'tenant_id'];

    protected function casts(): array
    {
        return ['follow_up_at' => 'datetime', 'walkthrough_at' => 'datetime'];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
