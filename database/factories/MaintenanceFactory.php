<?php

namespace Database\Factories;

use App\Models\Maintenance;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Maintenance>
 */
class MaintenanceFactory extends Factory
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
            'unit_id' => Unit::factory(),
            'tenant_id' => Tenant::factory(),
            'category' => $this->faker->randomElement(['plumbing', 'electrical', 'hvac', 'structural', 'appliances', 'general']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['open', 'in_progress', 'scheduled', 'completed', 'cancelled']),
            'assigned_to' => $this->faker->optional()->name(),
            'scheduled_date' => $this->faker->optional()->date(),
            'completed_date' => $this->faker->optional()->date(),
            'estimated_cost' => $this->faker->optional()->randomFloat(2, 50, 5000),
            'actual_cost' => $this->faker->optional()->randomFloat(2, 50, 5000),
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
