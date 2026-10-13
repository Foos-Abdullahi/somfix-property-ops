<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        return Inertia::render('repair-requests/index', ['requests' => $requests]);
    }

    public function photo(Request $request, RepairRequest $repairRequest): StreamedResponse
    {
        abort_unless($request->user()->hasPermission('maintenance.view'), 403);
        abort_unless($repairRequest->photo_path && Storage::disk('local')->exists($repairRequest->photo_path), 404);

        return Storage::disk('local')->response($repairRequest->photo_path, headers: ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
