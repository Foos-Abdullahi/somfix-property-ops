<?php

namespace Database\Factories;

use App\Models\Inventory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitCost = $this->faker->randomFloat(2, 5, 500);
        $openingStock = $this->faker->numberBetween(10, 500);

        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'sku' => $this->faker->unique()->numerify('INV-#####'),
            'unit_of_measure' => $this->faker->randomElement(['pcs', 'kg', 'liters', 'meters', 'boxes', 'rolls']),
            'category' => $this->faker->randomElement(['hardware', 'plumbing', 'electrical', 'paint', 'tools', 'materials']),
            'opening_stock' => $openingStock,
            'current_stock' => $this->faker->numberBetween(0, $openingStock),
            'reorder_level' => $this->faker->numberBetween(5, 50),
            'supplier' => $this->faker->company(),
            'unit_cost' => $unitCost,
            'total_value' => $unitCost * $openingStock,
            'status' => $this->faker->randomElement(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']),
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
