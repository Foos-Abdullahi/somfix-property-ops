<?php

namespace App\Models;

use Database\Factories\ServiceTeamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $specialization
 * @property string $phone
 * @property string $email
 * @property string $status
 * @property string|null $district
 * @property string|null $notes
 */
#[Fillable([
    'name',
    'specialization',
    'district',
    'phone',
    'email',
    'status',
    'staff_type',
    'commission_percent',
    'monthly_salary',
    'monthly_allowances',
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
        return ['commission_percent' => 'decimal:2', 'monthly_salary' => 'decimal:2', 'monthly_allowances' => 'decimal:2'];
    }

    /** @return HasMany<TechnicianPayout, $this> */
    public function technicianPayouts(): HasMany
    {
        return $this->hasMany(TechnicianPayout::class);
    }

    /** @return HasMany<PayrollEntry, $this> */
    public function payrollEntries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class);
    }
}
