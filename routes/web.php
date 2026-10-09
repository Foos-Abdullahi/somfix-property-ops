<?php

use App\Http\Controllers\DemoRequestController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ServiceTeamController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::post('/demo-requests', [DemoRequestController::class, 'store'])->middleware('throttle:5,1')->name('demo-inquiries.store');

Route::middleware('auth')->group(function () {
    Route::get('demo-requests/create', [DemoRequestController::class, 'create'])->name('demo-requests.create');
    Route::post('demo-requests/admin', [DemoRequestController::class, 'adminStore'])->name('demo-requests.store');
    Route::get('demo-requests/{demoRequest}/edit', [DemoRequestController::class, 'edit'])->name('demo-requests.edit');
    Route::delete('demo-requests/{demoRequest}', [DemoRequestController::class, 'destroy'])->name('demo-requests.destroy');
    Route::patch('demo-requests/{demoRequest}/restore', [DemoRequestController::class, 'restore'])->withTrashed()->name('demo-requests.restore');
    Route::get('demo-requests', [DemoRequestController::class, 'index'])->name('demo-requests.index');
    Route::get('demo-requests/{demoRequest}', [DemoRequestController::class, 'show'])->name('demo-requests.show');
    Route::put('demo-requests/{demoRequest}', [DemoRequestController::class, 'update'])->name('demo-requests.update');
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('properties', PropertyController::class);
    Route::resource('units', UnitController::class);
    Route::resource('tenants', TenantController::class);
    Route::resource('leases', LeaseController::class);
    Route::resource('maintenance', MaintenanceController::class);
    Route::resource('work-orders', WorkOrderController::class);
    Route::resource('service-team', ServiceTeamController::class);
    Route::resource('inventory', InventoryController::class);
    Route::resource('finance', FinanceController::class);
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
