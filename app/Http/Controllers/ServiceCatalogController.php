<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceCatalogRequest;
use App\Models\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceCatalogController extends Controller
{
    public function index(): Response
    {
        $services = ServiceCatalog::query()->orderBy('category')->orderBy('name')->get();

        return Inertia::render('service-list/index', [
            'services' => $services,
            'stats' => [
                'total' => $services->count(),
                'active' => $services->where('status', 'active')->count(),
                'categories' => $services->pluck('category')->unique()->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('service-list/create', ['categories' => $this->categories()]);
    }

    public function store(StoreServiceCatalogRequest $request): RedirectResponse
    {
        $service = ServiceCatalog::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Service added to the list.']);

        return to_route('service-list.show', $service);
    }

    public function show(ServiceCatalog $serviceList): Response
    {
        return Inertia::render('service-list/show', ['service' => $serviceList]);
    }

    public function edit(ServiceCatalog $serviceList): Response
    {
        return Inertia::render('service-list/edit', ['service' => $serviceList, 'categories' => $this->categories()]);
    }

    public function update(StoreServiceCatalogRequest $request, ServiceCatalog $serviceList): RedirectResponse
    {
        $serviceList->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Service updated.']);

        return to_route('service-list.show', $serviceList);
    }

    public function destroy(ServiceCatalog $serviceList): RedirectResponse
    {
        $serviceList->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Service deleted.']);

        return to_route('service-list.index');
    }

    /** @return list<string> */
    private function categories(): array
    {
        return ServiceCatalog::query()->distinct()->orderBy('category')->pluck('category')->all();
    }
}
