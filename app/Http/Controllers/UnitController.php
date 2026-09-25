<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Models\Property;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::query()->with('property:id,name')->latest()->get();

        return Inertia::render('units/index', [
            'units' => $units,
            'stats' => [
                'totalUnits' => $units->count(),
                'vacantUnits' => $units->where('status', 'vacant')->count(),
                'occupiedUnits' => $units->where('status', 'occupied')->count(),
                'maintenanceUnits' => $units->where('status', 'maintenance')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('units/create', ['properties' => $this->properties()]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        $unit = Unit::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit created successfully.']);

        return to_route('units.show', $unit);
    }

    public function show(Unit $unit): Response
    {
        return Inertia::render('units/show', ['unit' => $unit->load('property:id,name')]);
    }

    public function edit(Unit $unit): Response
    {
        return Inertia::render('units/edit', [
            'unit' => $unit,
            'properties' => $this->properties(),
        ]);
    }

    public function update(UpdateUnitRequest $request, Unit $unit): RedirectResponse
    {
        $unit->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit updated successfully.']);

        return to_route('units.show', $unit);
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $unit->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Unit deleted successfully.']);

        return to_route('units.index');
    }

    /**
     * @return Collection<int, Property>
     */
    private function properties()
    {
        return Property::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
