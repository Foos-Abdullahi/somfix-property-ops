<?php

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can manage units', function () {
    $user = User::factory()->create();
    $property = Property::factory()->create();

    $this->actingAs($user)
        ->post(route('units.store'), [
            'property_id' => $property->id,
            'unit_number' => 'A-101',
            'unit_type' => 'Apartment',
            'floor' => '1',
            'bedrooms' => 2,
            'bathrooms' => 1,
            'monthly_rent' => 650,
            'status' => 'vacant',
        ])
        ->assertRedirect();

    $unit = Unit::firstOrFail();

    $this->assertDatabaseHas('units', ['id' => $unit->id, 'unit_number' => 'A-101']);

    $this->actingAs($user)
        ->get(route('units.index'))
        ->assertInertia(fn (Assert $page) => $page->component('units/index'));
});

test('authenticated users can manage tenants', function () {
    $user = User::factory()->create();
    $unit = Unit::factory()->create();

    $this->actingAs($user)
        ->post(route('tenants.store'), [
            'unit_id' => $unit->id,
            'first_name' => 'Ayaan',
            'last_name' => 'Ali',
            'phone' => '+252 61 000 0000',
            'email' => 'ayaan@example.com',
            'status' => 'active',
        ])
        ->assertRedirect();

    $tenant = Tenant::firstOrFail();

    $this->assertDatabaseHas('tenants', ['id' => $tenant->id, 'unit_id' => $unit->id]);

    $this->actingAs($user)
        ->get(route('tenants.index'))
        ->assertInertia(fn (Assert $page) => $page->component('tenants/index'));
});
