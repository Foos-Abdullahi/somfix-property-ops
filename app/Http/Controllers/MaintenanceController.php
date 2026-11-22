<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaintenanceRequest;
use App\Http\Requests\UpdateMaintenanceRequest;
use App\Models\Customer;
use App\Models\Maintenance;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use App\Support\ImageUploads;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    /**
     * Display the maintenance register.
     */
    public function index(): Response
    {
        $maintenances = Maintenance::query()
            ->with(['property', 'unit', 'tenant', 'customer'])
            ->latest()
            ->get();

        return Inertia::render('maintenance/index', [
            'maintenances' => $maintenances,
            'stats' => [
                'totalRequests' => $maintenances->count(),
                'openRequests' => $maintenances->where('status', 'open')->count(),
                'inProgress' => $maintenances->where('status', 'in_progress')->count(),
                'urgentRequests' => $maintenances->where('priority', 'urgent')->count(),
            ],
        ]);
    }

    /**
     * Show the maintenance creation form.
     */
    public function create(): Response
    {
        return Inertia::render('maintenance/create', [
            'properties' => Property::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'units' => Unit::query()
                ->with('property:id,name')
                ->orderBy('unit_number')
                ->get(['id', 'unit_number', 'property_id']),
            'tenants' => Tenant::query()
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    /**
     * Store a newly created maintenance request.
     */
    public function store(StoreMaintenanceRequest $request): RedirectResponse
    {
        $maintenance = Maintenance::create(ImageUploads::apply($request->validated(), [], $request->file('new_images', []), 'maintenance'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Maintenance request created successfully.',
        ]);

        return to_route('maintenance.show', $maintenance);
    }

    /**
     * Display the specified maintenance request.
     */
    public function show(Maintenance $maintenance): Response
    {
        $maintenance->load(['property', 'unit', 'tenant', 'customer']);

        return Inertia::render('maintenance/show', [
            'maintenance' => $maintenance,
        ]);
    }

    /**
     * Show the maintenance edit form.
     */
    public function edit(Maintenance $maintenance): Response
    {
        $maintenance->load(['property', 'unit', 'tenant', 'customer']);

        return Inertia::render('maintenance/edit', [
            'maintenance' => $maintenance,
            'properties' => Property::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'units' => Unit::query()
                ->with('property:id,name')
                ->orderBy('unit_number')
                ->get(['id', 'unit_number', 'property_id']),
            'tenants' => Tenant::query()
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    /**
     * Update the specified maintenance request.
     */
    public function update(UpdateMaintenanceRequest $request, Maintenance $maintenance): RedirectResponse
    {
        $maintenance->update(ImageUploads::apply($request->validated(), $maintenance->images ?? [], $request->file('new_images', []), 'maintenance'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Maintenance request updated successfully.',
        ]);

        return to_route('maintenance.show', $maintenance);
    }

    /**
     * Remove the specified maintenance request.
     */
    public function destroy(Maintenance $maintenance): RedirectResponse
    {
        $maintenance->delete();
        ImageUploads::purge($maintenance->images);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Maintenance request deleted successfully.',
        ]);

        return to_route('maintenance.index');
    }
}
