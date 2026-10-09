<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaseRequest;
use App\Http\Requests\UpdateLeaseRequest;
use App\Models\Lease;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeaseController extends Controller
{
    /**
     * Display the lease register.
     */
    public function index(): Response
    {
        $leases = Lease::query()
            ->with(['tenant', 'unit.property'])
            ->latest()
            ->get();

        return Inertia::render('leases/index', [
            'leases' => $leases,
            'stats' => [
                'totalLeases' => $leases->count(),
                'activeLeases' => $leases->where('status', 'active')->count(),
                'expiringSoon' => $leases->where('status', 'active')
                    ->where('end_date', '>', now())
                    ->where('end_date', '<=', now()->addDays(30))
                    ->count(),
            ],
        ]);
    }

    /**
     * Show the lease creation form.
     */
    public function create(): Response
    {
        return Inertia::render('leases/create', [
            'tenants' => Tenant::query()
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
            'units' => Unit::query()
                ->with('property:id,name')
                ->orderBy('unit_number')
                ->get(['id', 'unit_number', 'property_id']),
        ]);
    }

    /**
     * Store a newly created lease.
     */
    public function store(StoreLeaseRequest $request): RedirectResponse
    {
        $lease = Lease::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lease created successfully.',
        ]);

        return to_route('leases.show', $lease);
    }

    /**
     * Display the specified lease.
     */
    public function show(Lease $lease): Response
    {
        $lease->load(['tenant', 'unit.property']);

        return Inertia::render('leases/show', [
            'lease' => $lease,
        ]);
    }

    /**
     * Show the lease edit form.
     */
    public function edit(Lease $lease): Response
    {
        $lease->load(['tenant', 'unit.property']);

        return Inertia::render('leases/edit', [
            'lease' => $lease,
            'tenants' => Tenant::query()
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
            'units' => Unit::query()
                ->with('property:id,name')
                ->orderBy('unit_number')
                ->get(['id', 'unit_number', 'property_id']),
        ]);
    }

    /**
     * Update the specified lease.
     */
    public function update(UpdateLeaseRequest $request, Lease $lease): RedirectResponse
    {
        $lease->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lease updated successfully.',
        ]);

        return to_route('leases.show', $lease);
    }

    /**
     * Remove the specified lease.
     */
    public function destroy(Lease $lease): RedirectResponse
    {
        $lease->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Lease deleted successfully.',
        ]);

        return to_route('leases.index');
    }
}
