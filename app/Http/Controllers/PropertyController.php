<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    /**
     * Display the property register.
     */
    public function index(): Response
    {
        $properties = Property::query()
            ->latest()
            ->get();

        return Inertia::render('properties/index', [
            'properties' => $properties,
            'stats' => [
                'totalProperties' => $properties->count(),
                'totalUnits' => $properties->sum('units_count'),
                'activeProperties' => $properties->where('status', 'active')->count(),
            ],
        ]);
    }

    /**
     * Show the property creation form.
     */
    public function create(): Response
    {
        return Inertia::render('properties/create');
    }

    /**
     * Store a newly created property.
     */
    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $property = Property::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Property created successfully.',
        ]);

        return to_route('properties.show', $property);
    }

    /**
     * Display the specified property.
     */
    public function show(Property $property): Response
    {
        return Inertia::render('properties/show', [
            'property' => $property,
        ]);
    }

    /**
     * Show the property edit form.
     */
    public function edit(Property $property): Response
    {
        return Inertia::render('properties/edit', [
            'property' => $property,
        ]);
    }

    /**
     * Update the specified property.
     */
    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $property->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Property updated successfully.',
        ]);

        return to_route('properties.show', $property);
    }

    /**
     * Remove the specified property.
     */
    public function destroy(Property $property): RedirectResponse
    {
        $property->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Property deleted successfully.',
        ]);

        return to_route('properties.index');
    }
}
