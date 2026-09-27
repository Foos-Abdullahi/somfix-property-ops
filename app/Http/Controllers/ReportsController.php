<?php

namespace App\Http\Controllers;

use App\Models\Finance;
use App\Models\Inventory;
use App\Models\Lease;
use App\Models\Maintenance;
use App\Models\Property;
use App\Models\ServiceTeam;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\WorkOrder;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('reports/index', [
            'stats' => [
                'properties' => Property::count(),
                'units' => Unit::count(),
                'tenants' => Tenant::count(),
                'leases' => Lease::count(),
                'maintenance' => Maintenance::count(),
                'workOrders' => WorkOrder::count(),
                'serviceTeam' => ServiceTeam::count(),
                'inventory' => Inventory::count(),
                'finance' => Finance::count(),
            ],
            'occupancy' => [
                'totalUnits' => Unit::count(),
                'occupiedUnits' => Unit::where('status', 'occupied')->count(),
                'vacantUnits' => Unit::where('status', 'vacant')->count(),
                'occupancyRate' => Unit::count() > 0 ? round((Unit::where('status', 'occupied')->count() / Unit::count()) * 100, 1) : 0,
            ],
            'maintenance' => [
                'totalRequests' => Maintenance::count(),
                'openRequests' => Maintenance::where('status', 'open')->count(),
                'inProgress' => Maintenance::where('status', 'in_progress')->count(),
                'completed' => Maintenance::where('status', 'completed')->count(),
            ],
            'finance' => [
                'totalRevenue' => Finance::where('type', 'invoice')->sum('amount'),
                'totalPaid' => Finance::where('type', 'invoice')->sum('paid_amount'),
                'totalBalance' => Finance::where('type', 'invoice')->sum('balance'),
                'totalExpenses' => Finance::where('type', 'expense')->sum('amount'),
            ],
            'inventory' => [
                'totalItems' => Inventory::count(),
                'inStock' => Inventory::where('status', 'in_stock')->count(),
                'lowStock' => Inventory::where('status', 'low_stock')->count(),
                'outOfStock' => Inventory::where('status', 'out_of_stock')->count(),
            ],
        ]);
    }
}
