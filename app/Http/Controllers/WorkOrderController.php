<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkOrderRequest;
use App\Http\Requests\UpdateWorkOrderRequest;
use App\Models\Maintenance;
use App\Models\ServiceTeam;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    /**
     * Display the work order register.
     */
    public function index(): Response
    {
        $workOrders = WorkOrder::query()
            ->with(['maintenance', 'serviceTeam'])
            ->latest()
            ->get();

        return Inertia::render('work-orders/index', [
            'workOrders' => $workOrders,
            'stats' => [
                'totalOrders' => $workOrders->count(),
                'pendingOrders' => $workOrders->where('status', 'pending')->count(),
                'inProgress' => $workOrders->where('status', 'in_progress')->count(),
                'completedOrders' => $workOrders->where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * Show the work order creation form.
     */
    public function create(): Response
    {
        return Inertia::render('work-orders/create', [
            'maintenances' => Maintenance::query()

                ->orderBy('created_at')
                ->get(['id', 'title', 'category', 'priority', 'status']),
            'serviceTeams' => ServiceTeam::query()

                ->orderBy('name')
                ->get(['id', 'name', 'specialization', 'status']),
        ]);
    }

    /**
     * Store a newly created work order.
     */
    public function store(StoreWorkOrderRequest $request): RedirectResponse
    {
        $workOrder = WorkOrder::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Work order created successfully.',
        ]);

        return to_route('work-orders.show', $workOrder);
    }

    /**
     * Display the specified work order.
     */
    public function show(WorkOrder $workOrder): Response
    {
        $workOrder->load(['maintenance', 'serviceTeam']);

        return Inertia::render('work-orders/show', [
            'workOrder' => $workOrder,
        ]);
    }

    /**
     * Show the work order edit form.
     */
    public function edit(WorkOrder $workOrder): Response
    {
        $workOrder->load(['maintenance', 'serviceTeam']);

        return Inertia::render('work-orders/edit', [
            'workOrder' => $workOrder,
            'maintenances' => Maintenance::query()
                ->orderBy('created_at')
                ->get(['id', 'title', 'category', 'priority', 'status']),
            'serviceTeams' => ServiceTeam::query()

                ->orderBy('name')
                ->get(['id', 'name', 'specialization', 'status']),
        ]);
    }

    /**
     * Update the specified work order.
     */
    public function update(UpdateWorkOrderRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        $workOrder->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Work order updated successfully.',
        ]);

        return to_route('work-orders.show', $workOrder);
    }

    /**
     * Remove the specified work order.
     */
    public function destroy(WorkOrder $workOrder): RedirectResponse
    {
        $workOrder->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Work order deleted successfully.',
        ]);

        return to_route('work-orders.index');
    }
}
