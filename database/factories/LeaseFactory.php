<?php

namespace Database\Factories;

use App\Models\Lease;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lease>
 */
class LeaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'unit_id' => Unit::factory(),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'monthly_rent' => $this->faker->randomFloat(2, 500, 5000),
            'deposit_amount' => $this->faker->randomFloat(2, 500, 5000),
            'status' => $this->faker->randomElement(['active', 'expired', 'pending', 'terminated']),
            'payment_due_day' => $this->faker->numberBetween(1, 28),
            'currency' => 'USD',
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
