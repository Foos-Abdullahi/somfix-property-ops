<?php

use App\Http\Controllers\LeaseController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('properties', PropertyController::class);
    Route::resource('units', UnitController::class);
    Route::resource('tenants', TenantController::class);
    Route::resource('leases', LeaseController::class);
    Route::resource('maintenance', MaintenanceController::class);
    Route::inertia('work-orders', 'work-orders/index')->name('work-orders.index');
    Route::inertia('service-team', 'service-team/index')->name('service-team.index');
    Route::inertia('inventory', 'inventory/index')->name('inventory.index');
    Route::inertia('finance', 'finance/index')->name('finance.index');
    Route::inertia('reports', 'reports/index')->name('reports.index');
});

require __DIR__.'/settings.php';
