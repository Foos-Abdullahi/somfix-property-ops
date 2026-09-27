<?php

namespace Database\Factories;

use App\Models\Finance;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Finance>
 */
class FinanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 100, 10000);
        $paidAmount = $this->faker->randomFloat(2, 0, $amount);

        return [
            'invoice_number' => $this->faker->unique()->numerify('INV-#####'),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(['invoice', 'quote', 'expense']),
            'currency' => $this->faker->randomElement(['USD', 'SOS']),
            'amount' => $amount,
            'paid_amount' => $paidAmount,
            'balance' => $amount - $paidAmount,
            'due_date' => $this->faker->optional()->date(),
            'paid_date' => $paidAmount > 0 ? $this->faker->optional()->date() : null,
            'status' => $this->faker->randomElement(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
            'property_id' => Property::factory(),
            'unit_id' => Unit::factory(),
            'tenant_id' => Tenant::factory(),
            'recipient_name' => $this->faker->name(),
            'recipient_email' => $this->faker->email(),
            'notes' => $this->faker->optional()->text(),
        ];
    }
}
