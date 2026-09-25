<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Residences',
            'property_type' => fake()->randomElement(['Apartment', 'Villa', 'Commercial']),
            'owner_name' => fake()->name(),
            'district' => fake()->randomElement(['Hodan', 'Wadajir', 'Waberi']),
            'city' => 'Mogadishu',
            'address' => fake()->streetAddress(),
            'units_count' => fake()->numberBetween(1, 24),
            'status' => 'active',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
