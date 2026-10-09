<?php

namespace App\Models;

use Database\Factories\ServiceTeamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $specialization
 * @property string $phone
 * @property string $email
 * @property string $status
 * @property string|null $notes
 */
#[Fillable([
    'name',
    'specialization',
    'phone',
    'email',
    'status',
    'notes',
])]
class ServiceTeam extends Model
{
    /** @use HasFactory<ServiceTeamFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [];
    }
}
