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

class MyRepairRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $requests = $request->user()->repairRequests()
            ->latest()
            ->paginate(10)
            ->through(fn (RepairRequest $repair) => $this->requestData($repair));

        return Inertia::render('my-requests/index', ['requests' => $requests]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'area' => ['nullable', 'string', 'max:120'],
            'service' => ['required', Rule::in(RepairRequestController::SERVICES)],
            'message' => ['nullable', 'string', 'max:3000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        unset($data['photo']);
        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('repair-requests', 'local');
        }

        try {
            $request->user()->repairRequests()->create($data);
        } catch (\Throwable $exception) {
            if (! empty($data['photo_path'])) {
                Storage::disk('local')->delete($data['photo_path']);
            }
            throw $exception;
        }

        return to_route('my-requests.index')->with('toast', [
            'type' => 'success',
            'message' => 'Your repair request has been sent. We will contact you soon.',
        ]);
    }

    public function photo(Request $request, RepairRequest $repairRequest): StreamedResponse
    {
        abort_unless($repairRequest->user_id === $request->user()->id, 404);
        abort_unless($repairRequest->photo_path && Storage::disk('local')->exists($repairRequest->photo_path), 404);

        return Storage::disk('local')->response($repairRequest->photo_path, headers: [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function requestData(RepairRequest $repair): array
    {
        return [
            'id' => $repair->id,
            'service' => $repair->service,
            'area' => $repair->area,
            'message' => $repair->message,
            'status' => $repair->status,
            'created_at' => $repair->created_at?->toIso8601String(),
            'photo_url' => $repair->photo_path ? route('my-requests.photo', $repair) : null,
        ];
    }
}
