<?php

use App\Models\Property;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the property register', function () {
    $this->get(route('properties.index'))->assertRedirect(route('login'));
});

test('authenticated users can create and update a property', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('properties.store'), [
            'name' => 'Hodan Heights',
            'property_type' => 'Apartment',
            'owner_name' => 'Somfix Holdings',
            'district' => 'Hodan',
            'city' => 'Mogadishu',
            'address' => 'KM4 Road',
            'units_count' => 12,
            'status' => 'active',
            'notes' => 'Main portfolio property.',
        ])
        ->assertRedirect();

    $property = Property::firstOrFail();

    $this->assertDatabaseHas('properties', [
        'id' => $property->id,
        'name' => 'Hodan Heights',
        'units_count' => 12,
    ]);

    $this->actingAs($user)
        ->put(route('properties.update', $property), [
            'name' => 'Hodan Heights',
            'property_type' => 'Apartment',
            'owner_name' => 'Somfix Holdings',
            'district' => 'Hodan',
            'city' => 'Mogadishu',
            'address' => 'KM4 Road',
            'units_count' => 14,
            'status' => 'active',
            'notes' => 'Updated unit inventory.',
        ])
        ->assertRedirect(route('properties.show', $property));

    $this->assertDatabaseHas('properties', [
        'id' => $property->id,
        'units_count' => 14,
        'notes' => 'Updated unit inventory.',
    ]);
});

test('property pages render the expected Inertia components', function () {
    $user = User::factory()->create();
    $property = Property::factory()->create();

    $this->actingAs($user)
        ->get(route('properties.index'))
        ->assertInertia(fn (Assert $page) => $page->component('properties/index'));

    $this->actingAs($user)
        ->get(route('properties.create'))
        ->assertInertia(fn (Assert $page) => $page->component('properties/create'));

    $this->actingAs($user)
        ->get(route('properties.show', $property))
        ->assertInertia(fn (Assert $page) => $page->component('properties/show'));

    $this->actingAs($user)
        ->get(route('properties.edit', $property))
        ->assertInertia(fn (Assert $page) => $page->component('properties/edit'));
});

test('property creation requires the core profile fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('properties.store'), [])
        ->assertSessionHasErrors(['name', 'property_type', 'city', 'units_count', 'status']);

    $this->assertDatabaseCount('properties', 0);
});
