<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Models\Tenant;
use App\Models\Unit;
use App\Support\ImageUploads;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::query()->with('unit.property:id,name')->latest()->get();

        return Inertia::render('tenants/index', [
            'tenants' => $tenants,
            'stats' => [
                'totalTenants' => $tenants->count(),
                'activeTenants' => $tenants->where('status', 'active')->count(),
                'assignedTenants' => $tenants->whereNotNull('unit_id')->count(),
                'unassignedTenants' => $tenants->whereNull('unit_id')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenants/create', ['units' => $this->units()]);
    }

    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = Tenant::create(ImageUploads::apply($request->validated(), [], $request->file('new_images', []), 'tenants'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tenant created successfully.']);

        return to_route('tenants.show', $tenant);
    }

    public function show(Tenant $tenant): Response
    {
        return Inertia::render('tenants/show', ['tenant' => $tenant->load('unit.property:id,name')]);
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('tenants/edit', [
            'tenant' => $tenant,
            'units' => $this->units(),
        ]);
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update(ImageUploads::apply($request->validated(), $tenant->images ?? [], $request->file('new_images', []), 'tenants'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tenant updated successfully.']);

        return to_route('tenants.show', $tenant);
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $tenant->delete();
        ImageUploads::purge($tenant->images);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tenant deleted successfully.']);

        return to_route('tenants.index');
    }

    /**
     * @return Collection<int, Unit>
     */
    private function units()
    {
        return Unit::query()
            ->with('property:id,name')
            ->orderBy('unit_number')
            ->get(['id', 'property_id', 'unit_number']);
    }
}
