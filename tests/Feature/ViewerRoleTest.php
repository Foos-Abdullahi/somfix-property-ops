<?php

use App\Models\Role;
use App\Models\User;

it('viewer can access read-only pages but sees 403 on manage routes', function () {
    $viewer = User::factory()->create(['role_id' => Role::where('slug', 'viewer')->value('id')]);
    $this->actingAs($viewer);

    $this->get('/properties')->assertOk();
    $this->get('/units')->assertOk();
    $this->get('/tenants')->assertOk();
    $this->get('/leases')->assertOk();
    $this->get('/maintenance')->assertOk();
    $this->get('/work-orders')->assertOk();
    $this->get('/service-team')->assertOk();
    $this->get('/inventory')->assertOk();

    $this->get('/properties/create')->assertForbidden();
    $this->get('/tenants/create')->assertForbidden();
    $this->post('/properties')->assertForbidden();
});

it('renders a branded 403 inertia page instead of plain text forbidden', function () {
    $viewer = User::factory()->create(['role_id' => Role::where('slug', 'viewer')->value('id')]);
    $this->actingAs($viewer)
        ->get('/properties/create')
        ->assertForbidden()
        ->assertInertia(fn ($page) => $page->component('error')->where('status', 403));
});

it('renders a 404 inertia page for unknown routes', function () {
    $admin = User::factory()->create(['role_id' => Role::where('slug', 'administrator')->value('id')]);
    $this->actingAs($admin)
        ->get('/this-page-does-not-exist-at-all')
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('error')->where('status', 404));
});
