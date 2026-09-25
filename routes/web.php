<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('properties', 'properties/index')->name('properties.index');
    Route::inertia('units', 'units/index')->name('units.index');
    Route::inertia('tenants', 'tenants/index')->name('tenants.index');
    Route::inertia('leases', 'leases/index')->name('leases.index');
    Route::inertia('maintenance', 'maintenance/index')->name('maintenance.index');
    Route::inertia('work-orders', 'work-orders/index')->name('work-orders.index');
    Route::inertia('service-team', 'service-team/index')->name('service-team.index');
    Route::inertia('inventory', 'inventory/index')->name('inventory.index');
    Route::inertia('finance', 'finance/index')->name('finance.index');
    Route::inertia('reports', 'reports/index')->name('reports.index');
});

require __DIR__.'/settings.php';
