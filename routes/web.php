<?php

use App\Http\Controllers\DemoRequestController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RecordImportController;
use App\Http\Controllers\RepairRequestController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ServiceTeamController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
foreach (['services', 'property-management', 'maintenance-plans', 'how-it-works', 'about', 'faq', 'contact'] as $page) {
    Route::inertia('/'.$page, 'welcome', ['publicPage' => $page])->name('public.'.$page);
}
Route::post('/repair-requests', [RepairRequestController::class, 'store'])->middleware('throttle:5,1')->name('repair-requests.store');
Route::get('/repair-requests', [RepairRequestController::class, 'index'])->middleware('auth')->name('repair-requests.index');
Route::get('/repair-requests/{repairRequest}/photo', [RepairRequestController::class, 'photo'])->middleware('auth')->name('repair-requests.photo');
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
    foreach (['tenants', 'service-team'] as $module) {
        Route::post($module.'/import', [RecordImportController::class, 'store'])->defaults('module', $module)->middleware('throttle:10,1')->name($module.'.import');
        Route::get($module.'/import-template', [RecordImportController::class, 'template'])->defaults('module', $module)->name($module.'.import-template');
    }
    Route::resource('tenants', TenantController::class);
    Route::resource('leases', LeaseController::class);
    Route::resource('maintenance', MaintenanceController::class);
    Route::resource('work-orders', WorkOrderController::class);
    Route::resource('service-team', ServiceTeamController::class);
    Route::resource('inventory', InventoryController::class);
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/', [SalesController::class, 'index'])->name('index');
        Route::get('customers', [SalesController::class, 'customers'])->name('customers.index');
        Route::get('customers/create', [SalesController::class, 'customerCreate'])->name('customers.create');
        Route::post('customers', [SalesController::class, 'customerStore'])->name('customers.store');
        Route::get('customers/{customer}', [SalesController::class, 'customerShow'])->name('customers.show');
        Route::get('customers/{customer}/edit', [SalesController::class, 'customerEdit'])->name('customers.edit');
        Route::put('customers/{customer}', [SalesController::class, 'customerUpdate'])->name('customers.update');

        Route::get('leads', [SalesController::class, 'leads'])->name('leads.index');
        Route::get('leads/create', [SalesController::class, 'leadCreate'])->name('leads.create');
        Route::post('leads', [SalesController::class, 'leadStore'])->name('leads.store');
        Route::get('leads/{lead}', [SalesController::class, 'leadShow'])->name('leads.show');
        Route::get('leads/{lead}/edit', [SalesController::class, 'leadEdit'])->name('leads.edit');
        Route::put('leads/{lead}', [SalesController::class, 'leadUpdate'])->name('leads.update');
        Route::post('leads/{lead}/create-job', [SalesController::class, 'createJobFromLead'])->name('leads.create-job');

        Route::get('jobs', [SalesController::class, 'jobs'])->name('jobs.index');
        Route::get('jobs/create', [SalesController::class, 'jobCreate'])->name('jobs.create');
        Route::post('jobs', [SalesController::class, 'jobStore'])->name('jobs.store');
        Route::get('jobs/{job}', [SalesController::class, 'jobShow'])->name('jobs.show');
        Route::get('jobs/{job}/edit', [SalesController::class, 'jobEdit'])->name('jobs.edit');
        Route::put('jobs/{job}', [SalesController::class, 'jobUpdate'])->name('jobs.update');
        Route::post('jobs/{job}/materials', [SalesController::class, 'addMaterial'])->name('jobs.materials.store');
        Route::post('jobs/{job}/labor', [SalesController::class, 'addLabor'])->name('jobs.labors.store');
        Route::post('invoices/{finance}/payments', [SalesController::class, 'recordPayment'])->name('invoices.payments.store');
        Route::get('payments/{payment}/receipt', [SalesController::class, 'receipt'])->name('payments.receipt');
    });
    // Finance module: Invoices, Quotations, Print & Overview
    Route::prefix('finance')->name('finance.')->group(function () {
        // Invoices CRUD
        Route::get('invoices', [FinanceController::class, 'invoicesIndex'])->name('invoices.index');
        Route::get('invoices/create', [FinanceController::class, 'createInvoice'])->name('invoices.create');
        Route::post('invoices', [FinanceController::class, 'storeInvoice'])->name('invoices.store');
        Route::get('invoices/{finance}', [FinanceController::class, 'showInvoice'])->name('invoices.show');
        Route::get('invoices/{finance}/edit', [FinanceController::class, 'editInvoice'])->name('invoices.edit');
        Route::put('invoices/{finance}', [FinanceController::class, 'updateInvoice'])->name('invoices.update');
        Route::delete('invoices/{finance}', [FinanceController::class, 'destroyInvoice'])->name('invoices.destroy');

        // Quotations CRUD
        Route::get('quotations', [FinanceController::class, 'quotationsIndex'])->name('quotations.index');
        Route::get('quotations/create', [FinanceController::class, 'createQuote'])->name('quotations.create');
        Route::post('quotations', [FinanceController::class, 'storeQuote'])->name('quotations.store');
        Route::get('quotations/{finance}', [FinanceController::class, 'showQuote'])->name('quotations.show');
        Route::get('quotations/{finance}/edit', [FinanceController::class, 'editQuote'])->name('quotations.edit');
        Route::put('quotations/{finance}', [FinanceController::class, 'updateQuote'])->name('quotations.update');
        Route::post('quotations/{finance}/convert', [FinanceController::class, 'convertQuote'])->name('quotations.convert');
        Route::delete('quotations/{finance}', [FinanceController::class, 'destroyQuote'])->name('quotations.destroy');

        // Direct compatibility routes for user links
        Route::get('create/invoice', [FinanceController::class, 'createInvoice'])->name('create.invoice');
        Route::get('create/quote', [FinanceController::class, 'createQuote'])->name('create.quote');
        Route::get('{finance}/print', [FinanceController::class, 'print'])->name('print');
    });
    Route::resource('finance', FinanceController::class);
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
