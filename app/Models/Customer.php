<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = ['name', 'type', 'phone', 'email', 'address', 'status', 'notes'];

    /** @return HasMany<Job, $this> */
    public function jobs(): HasMany { return $this->hasMany(Job::class); }
    /** @return HasMany<Lead, $this> */
    public function leads(): HasMany { return $this->hasMany(Lead::class); }
}
