<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Inventory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display the inventory register.
     */
    public function index(): Response
    {
        $inventories = Inventory::query()
            ->latest()
            ->get();

        return Inertia::render('inventory/index', [
            'inventories' => $inventories,
            'stats' => [
                'totalItems' => $inventories->count(),
                'inStock' => $inventories->where('status', 'in_stock')->count(),
                'lowStock' => $inventories->where('status', 'low_stock')->count(),
                'outOfStock' => $inventories->where('status', 'out_of_stock')->count(),
            ],
        ]);
    }

    /**
     * Show the inventory creation form.
     */
    public function create(): Response
    {
        return Inertia::render('inventory/create');
    }

    /**
     * Store a newly created inventory item.
     */
    public function store(StoreInventoryRequest $request): RedirectResponse
    {
        $inventory = Inventory::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Inventory item created successfully.',
        ]);

        return to_route('inventory.show', $inventory);
    }

    /**
     * Display the specified inventory item.
     */
    public function show(Inventory $inventory): Response
    {
        return Inertia::render('inventory/show', [
            'inventory' => $inventory,
        ]);
    }

    /**
     * Show the inventory edit form.
     */
    public function edit(Inventory $inventory): Response
    {
        return Inertia::render('inventory/edit', [
            'inventory' => $inventory,
        ]);
    }

    /**
     * Update the specified inventory item.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory): RedirectResponse
    {
        $inventory->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Inventory item updated successfully.',
        ]);

        return to_route('inventory.show', $inventory);
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy(Inventory $inventory): RedirectResponse
    {
        $inventory->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Inventory item deleted successfully.',
        ]);

        return to_route('inventory.index');
    }
}
