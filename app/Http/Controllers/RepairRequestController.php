<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\RepairRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RepairRequestController extends Controller
{
    public const SERVICES = ['Door repair', 'Window repair', 'Plumbing', 'Mosquito screens', 'Broken glass', 'Wardrobes & cabinets', 'Kitchen repair', 'Cleaning', 'Renovation', 'Any other household repair', 'Property management', 'Not sure'];

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'area' => ['nullable', 'string', 'max:120'],
            'service' => ['required', Rule::in(self::SERVICES)],
            'message' => ['nullable', 'string', 'max:3000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'website' => ['nullable', 'string', 'max:0'],
        ]);
        unset($data['website'], $data['photo']);
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('repair-requests', 'local');
        }
        try {
            RepairRequest::create($data);
        } catch (\Throwable $exception) {
            if (! empty($data['photo_path'])) {
                Storage::disk('local')->delete($data['photo_path']);
            }
            throw $exception;
        }

        return to_route('public.contact');
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()->hasPermission('maintenance.view'), 403);
        $requests = RepairRequest::latest()->paginate(20)->through(fn (RepairRequest $repair) => [
            ...$repair->toArray(),
            'photo_url' => $repair->photo_path ? route('repair-requests.photo', $repair) : null,
            'lead_url' => $repair->lead_id ? route('sales.leads.show', $repair->lead_id) : null,
        ]);

        return Inertia::render('repair-requests/index', ['requests' => $requests]);
    }

    public function convert(Request $request, RepairRequest $repairRequest): RedirectResponse
    {
        abort_unless($request->user()->hasPermission('maintenance.view'), 403);

        if ($repairRequest->lead_id) {
            return to_route('sales.leads.show', $repairRequest->lead_id);
        }

        $lead = DB::transaction(function () use ($repairRequest): Lead {
            $customer = Customer::firstOrCreate(
                ['phone' => $repairRequest->phone],
                [
                    'name' => $repairRequest->name,
                    'type' => 'individual',
                    'address' => $repairRequest->area,
                    'status' => 'active',
                    'notes' => 'Created from website repair request #'.$repairRequest->id,
                ],
            );

            $lead = Lead::create([
                'customer_id' => $customer->id,
                'source' => 'website',
                'service_category' => $repairRequest->service,
                'title' => $repairRequest->service.' request from '.$repairRequest->name,
                'description' => $repairRequest->message ?: 'Website repair request. Contact the customer to confirm the scope.',
                'status' => 'new',
                'notes' => $repairRequest->area ? 'Service area: '.$repairRequest->area : null,
            ]);

            $repairRequest->update([
                'status' => 'converted',
                'customer_id' => $customer->id,
                'lead_id' => $lead->id,
                'converted_at' => now(),
            ]);

            return $lead;
        });

        return to_route('sales.leads.show', $lead)->with('toast', [
            'type' => 'success',
            'message' => 'Website request converted to a customer and lead.',
        ]);
    }

    public function photo(Request $request, RepairRequest $repairRequest): StreamedResponse
    {
        abort_unless($request->user()->hasPermission('maintenance.view'), 403);
        abort_unless($repairRequest->photo_path && Storage::disk('local')->exists($repairRequest->photo_path), 404);

        return Storage::disk('local')->response($repairRequest->photo_path, headers: ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
