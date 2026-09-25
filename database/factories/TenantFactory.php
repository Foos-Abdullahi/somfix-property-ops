<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'unit_id' => Unit::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'whatsapp' => fake()->phoneNumber(),
            'emergency_contact' => fake()->name().' · '.fake()->phoneNumber(),
            'status' => 'active',
            'move_in_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
