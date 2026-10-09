<?php

use App\Models\Maintenance;
use App\Models\ServiceTeam;
use App\Models\User;
use App\Models\WorkOrder;
use Inertia\Testing\AssertableInertia as Assert;

it('includes existing requests and service members regardless of status', function () {
    $maintenance = Maintenance::factory()->create(['status' => 'completed']);
    $team = ServiceTeam::factory()->create(['status' => 'inactive']);

    $this->actingAs(User::factory()->create())
        ->get(route('work-orders.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work-orders/create')
            ->has('maintenances', 1)
            ->where('maintenances.0.id', $maintenance->id)
            ->where('maintenances.0.status', 'completed')
            ->has('serviceTeams', 1)
            ->where('serviceTeams.0.id', $team->id)
            ->where('serviceTeams.0.status', 'inactive'));
});

it('creates a work order with the selected request and optional team', function (bool $assigned) {
    $maintenance = Maintenance::factory()->create(['status' => 'completed']);
    $team = ServiceTeam::factory()->create(['status' => 'inactive']);

    $this->actingAs(User::factory()->create())
        ->post(route('work-orders.store'), [
            'maintenance_id' => (string) $maintenance->id,
            'service_team_id' => $assigned ? (string) $team->id : '',
            'title' => 'Follow-up repair',
            'description' => 'Inspect and repair the reported issue.',
            'status' => 'pending',
            'estimated_hours' => '1.5',
            'actual_hours' => '',
            'assigned_date' => '',
            'started_date' => '',
            'completed_date' => '',
            'notes' => '',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('work-orders.show', WorkOrder::query()->sole()));

    $order = WorkOrder::query()->sole();
    expect($order->maintenance_id)->toBe($maintenance->id);
    expect($order->service_team_id)->toBe($assigned ? $team->id : null);
    expect($order->estimated_hours)->toBe('1.50');

    $this->get(route('work-orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work-orders/show')
            ->where('workOrder.maintenance.id', $maintenance->id)
            ->where('workOrder.service_team', fn ($value) => $assigned ? $value['id'] === $team->id : $value === null));
})->with([true, false]);

it('rejects missing requests and nonexistent team assignments', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('work-orders.store'), [
            'maintenance_id' => '',
            'service_team_id' => 999999,
            'title' => 'Repair',
            'description' => 'Repair description',
            'status' => 'pending',
        ])
        ->assertSessionHasErrors(['maintenance_id', 'service_team_id']);

    expect(WorkOrder::query()->count())->toBe(0);
});
