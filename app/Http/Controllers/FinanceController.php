<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceRequest;
use App\Http\Requests\UpdateFinanceRequest;
use App\Models\Finance;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display the finance register.
     */
    public function index(): Response
    {
        $finances = Finance::query()
            ->with(['property', 'unit', 'tenant'])
            ->latest()
            ->get();

        return Inertia::render('finance/index', [
            'finances' => $finances,
            'stats' => [
                'totalRecords' => $finances->count(),
                'totalAmount' => $finances->sum('amount'),
                'totalPaid' => $finances->sum('paid_amount'),
                'totalBalance' => $finances->sum('balance'),
            ],
        ]);
    }

    /**
     * Show the finance creation form.
     */
    public function create(): Response
    {
        return Inertia::render('finance/create', [
            'properties' => Property::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'units' => Unit::query()
                ->orderBy('unit_number')
                ->get(['id', 'unit_number']),
            'tenants' => Tenant::query()
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
        ]);
    }

    /**
     * Store a newly created finance record.
     */
    public function store(StoreFinanceRequest $request): RedirectResponse
    {
        $finance = Finance::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record created successfully.',
        ]);

        return to_route('finance.show', $finance);
    }

    /**
     * Display the specified finance record.
     */
    public function show(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/show', [
            'finance' => $finance,
        ]);
    }

    /**
     * Show the finance edit form.
     */
    public function edit(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/edit', [
            'finance' => $finance,
            'properties' => Property::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'units' => Unit::query()
                ->orderBy('unit_number')
                ->get(['id', 'unit_number']),
            'tenants' => Tenant::query()
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name']),
        ]);
    }

    /**
     * Update the specified finance record.
     */
    public function update(UpdateFinanceRequest $request, Finance $finance): RedirectResponse
    {
        $finance->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record updated successfully.',
        ]);

        return to_route('finance.show', $finance);
    }

    /**
     * Remove the specified finance record.
     */
    public function destroy(Finance $finance): RedirectResponse
    {
        $finance->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record deleted successfully.',
        ]);

        return to_route('finance.index');
    }
}
