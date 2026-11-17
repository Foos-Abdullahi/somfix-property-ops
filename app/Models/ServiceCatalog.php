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

    public const NOT_SURE = 'Not sure';

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }

    /**
     * Service names customers can pick on the website and account forms.
     * The service list is the single source; "Not sure" is always allowed.
     *
     * @return list<string>
     */
    public static function requestOptions(): array
    {
        $names = static::query()->where('status', 'active')->orderBy('name')->pluck('name')->all();

        return [...array_values(array_diff($names, [self::NOT_SURE])), self::NOT_SURE];
    }

    /**
     * Active services for staff pickers (leads), with their starting price.
     *
     * @return list<array{name: string, category: string, price: string|null}>
     */
    public static function pickerOptions(): array
    {
        return static::query()->where('status', 'active')->orderBy('category')->orderBy('name')
            ->get(['name', 'category', 'price'])
            ->map(fn (self $service) => ['name' => $service->name, 'category' => $service->category, 'price' => $service->price])
            ->all();
    }

    public static function priceFor(?string $name): ?string
    {
        if ($name === null || $name === '') {
            return null;
        }

        return static::query()->whereRaw('lower(name) = ?', [mb_strtolower($name)])->value('price');
    }
}
