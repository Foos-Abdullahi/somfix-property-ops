<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

$workspacePages = [
    'properties' => ['properties.index', 'properties/index'],
    'units' => ['units.index', 'units/index'],
    'tenants' => ['tenants.index', 'tenants/index'],
    'leases' => ['leases.index', 'leases/index'],
    'maintenance' => ['maintenance.index', 'maintenance/index'],
    'work orders' => ['work-orders.index', 'work-orders/index'],
    'service team' => ['service-team.index', 'service-team/index'],
    'inventory' => ['inventory.index', 'inventory/index'],
    'finance' => ['finance.index', 'finance/index'],
    'reports' => ['reports.index', 'reports/index'],
];

test('guests can view the landing page', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

test('guests are redirected from workspace pages', function (string $routeName) use ($workspacePages) {
    [$routeName] = $workspacePages[$routeName];

    $this->get(route($routeName))->assertRedirect(route('login'));
})->with(array_keys($workspacePages));

test('verified users can view workspace pages', function (string $pageName) use ($workspacePages) {
    [$routeName, $component] = $workspacePages[$pageName];

    $this->actingAs(User::factory()->create())
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with(array_keys($workspacePages));

test('users can open the dashboard without email verification', function () {
    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('dashboard'))
        ->assertOk();
});
