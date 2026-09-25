<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'unit_number' => (string) fake()->unique()->numberBetween(1, 999),
            'unit_type' => fake()->randomElement(['Apartment', 'Studio', 'Office', 'Shop']),
            'floor' => (string) fake()->numberBetween(0, 20),
            'bedrooms' => fake()->numberBetween(0, 5),
            'bathrooms' => fake()->numberBetween(1, 3),
            'monthly_rent' => fake()->numberBetween(250, 2500),
            'status' => fake()->randomElement(['vacant', 'occupied', 'maintenance']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
