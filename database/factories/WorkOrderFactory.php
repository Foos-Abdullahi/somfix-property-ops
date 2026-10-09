<?php

namespace Database\Factories;

use App\Models\Maintenance;
use App\Models\ServiceTeam;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'maintenance_id' => Maintenance::factory(),
            'service_team_id' => ServiceTeam::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
            'assigned_date' => $this->faker->optional()->date(),
            'started_date' => $this->faker->optional()->date(),
            'completed_date' => $this->faker->optional()->date(),
            'estimated_hours' => $this->faker->optional()->randomFloat(1, 1, 40),
            'actual_hours' => $this->faker->optional()->randomFloat(1, 1, 40),
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
