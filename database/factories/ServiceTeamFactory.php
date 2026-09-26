<?php

namespace Database\Factories;

use App\Models\ServiceTeam;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceTeam>
 */
class ServiceTeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'specialization' => $this->faker->randomElement(['plumbing', 'electrical', 'hvac', 'general', 'carpentry', 'painting']),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->email(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'on_leave']),
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
