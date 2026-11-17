<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * A service SOMFIX offers (e.g. plumbing repair, AC servicing).
 * Standalone record: not linked to customers, tenants or properties.
 *
 * @property int $id
 * @property string $name
 * @property string $category
 * @property string|null $description
 * @property string|null $unit
 * @property string|null $price
 * @property string|null $duration
 * @property string $status
 * @property string|null $notes
 */
#[Fillable([
    'name',
    'category',
    'description',
    'unit',
    'price',
    'duration',
    'status',
    'notes',
])]
class ServiceCatalog extends Model
{
    protected $table = 'service_catalog';

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }
}
