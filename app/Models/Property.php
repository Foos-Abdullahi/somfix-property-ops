<?php

namespace App\Models;

use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $property_type
 * @property string|null $owner_name
 * @property string|null $district
 * @property string $city
 * @property string|null $address
 * @property int $units_count
 * @property string $status
 * @property string|null $notes
 */
#[Fillable([
    'name',
    'property_type',
    'owner_name',
    'owner_phone',
    'management_fee_type',
    'management_fee_percent',
    'management_fee_fixed',
    'district',
    'city',
    'address',
    'units_count',
    'status',
    'notes',
    'images',
])]
class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'images' => 'array',
            'units_count' => 'integer',
            'management_fee_percent' => 'decimal:2',
            'management_fee_fixed' => 'decimal:2',
        ];
    }

    /** @return HasMany<Unit, $this> */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    /** @return HasMany<RentCollection, $this> */
    public function rentCollections(): HasMany
    {
        return $this->hasMany(RentCollection::class);
    }

    /** @return HasMany<PropertyExpense, $this> */
    public function propertyExpenses(): HasMany
    {
        return $this->hasMany(PropertyExpense::class);
    }

    /** @return HasMany<OwnerPayout, $this> */
    public function ownerPayouts(): HasMany
    {
        return $this->hasMany(OwnerPayout::class);
    }
}
