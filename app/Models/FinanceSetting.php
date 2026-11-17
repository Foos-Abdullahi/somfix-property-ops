<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Stored settings merged over the config defaults.
     *
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        $defaults = config('finance.defaults');

        return array_merge($defaults, static::query()->pluck('value', 'key')->all());
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::values()[$key] ?? $default;
    }

    /** @param array<string, mixed> $values */
    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            static::query()->updateOrCreate(['key' => $key], ['value' => $value === null ? null : (string) $value]);
        }
    }
}
