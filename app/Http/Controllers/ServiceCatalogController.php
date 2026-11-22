<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceCatalogRequest;
use App\Models\Job;
use App\Models\Lead;
use App\Models\RepairRequest;
use App\Models\ServiceCatalog;
use App\Support\ImageUploads;
use Illuminate\Support\Facades\DB;
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
        $service = ServiceCatalog::create(
            ImageUploads::apply($request->validated(), [], $request->file('new_images', []), 'services'),
        );
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Service added to the list.']);

        return to_route('service-list.show', $service);
    }

    public function show(ServiceCatalog $serviceList): Response
    {
        $leads = Lead::query()->whereRaw('lower(service_category) = ?', [mb_strtolower($serviceList->name)]);

        return Inertia::render('service-list/show', [
            'service' => $serviceList,
            'usage' => [
                'requests' => RepairRequest::query()->whereRaw('lower(service) = ?', [mb_strtolower($serviceList->name)])->count(),
                'leads' => (clone $leads)->count(),
                'jobs' => Job::query()->whereIn('lead_id', (clone $leads)->select('id'))->count(),
            ],
        ]);
    }

    public function edit(ServiceCatalog $serviceList): Response
    {
        return Inertia::render('service-list/edit', ['service' => $serviceList, 'categories' => $this->categories()]);
    }

    public function update(StoreServiceCatalogRequest $request, ServiceCatalog $serviceList): RedirectResponse
    {
        DB::transaction(function () use ($request, $serviceList) {
            $oldName = $serviceList->name;
            $serviceList->update(
                ImageUploads::apply($request->validated(), $serviceList->images ?? [], $request->file('new_images', []), 'services'),
            );
            // Keep requests and leads pointing at the renamed service.
            if ($oldName !== $serviceList->name) {
                RepairRequest::query()->where('service', $oldName)->update(['service' => $serviceList->name]);
                Lead::query()->where('service_category', $oldName)->update(['service_category' => $serviceList->name]);
            }
        });
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
