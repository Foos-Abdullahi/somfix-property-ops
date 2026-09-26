<?php

namespace App\Models;

use Database\Factories\InventoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $description
 * @property string $sku
 * @property string $unit_of_measure
 * @property string $category
 * @property int $opening_stock
 * @property int $current_stock
 * @property int $reorder_level
 * @property string $supplier
 * @property string $unit_cost
 * @property string $total_value
 * @property string $status
 * @property string|null $notes
 */
#[Fillable([
    'name',
    'description',
    'sku',
    'unit_of_measure',
    'category',
    'opening_stock',
    'current_stock',
    'reorder_level',
    'supplier',
    'unit_cost',
    'total_value',
    'status',
    'notes',
])]
class Inventory extends Model
{
    /** @use HasFactory<InventoryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opening_stock' => 'integer',
            'current_stock' => 'integer',
            'reorder_level' => 'integer',
            'unit_cost' => 'decimal:2',
            'total_value' => 'decimal:2',
        ];
    }
}
