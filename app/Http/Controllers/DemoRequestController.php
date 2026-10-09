<?php

namespace App\Http\Controllers;

use App\Models\DemoRequest;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;
use Inertia\Response;

class DemoRequestController extends Controller
{
    public const STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'converted', 'closed'];

    public function index(Request $request): Response
    {
        $filters = $request->validate(['status' => ['nullable', Rule::in(self::STATUSES)], 'search' => ['nullable', 'string', 'max:120'], 'archived' => ['nullable', 'boolean'], 'per_page' => ['nullable', 'integer', Rule::in([10, 20, 50, 100])]]);
        $filters['archived'] = $request->boolean('archived');
        $query = DemoRequest::query()->when($request->boolean('archived'), fn ($query) => $query->onlyTrashed())->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')->orWhere('company', 'like', '%'.$search.'%');
            }));

        return Inertia::render('demo-requests/index', ['requests' => $query->latest()->paginate($filters['per_page'] ?? 20)->withQueryString(), 'filters' => $filters, 'stats' => [
            'total' => DemoRequest::count(), 'new' => DemoRequest::where('status', 'new')->count(),
            'scheduled' => DemoRequest::where('status', 'scheduled')->count(), 'converted' => DemoRequest::where('status', 'converted')->count(),
        ]]);
    }

    public function show(Request $request, DemoRequest $demoRequest): Response
    {
        return Inertia::render('demo-requests/show', [
            'inquiry' => $demoRequest,
            'tenants' => $request->user()->hasPermission('tenants.manage') ? Tenant::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email']) : [],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('demo-requests/create', ['tenants' => $this->tenants($request)]);
    }

    public function edit(Request $request, DemoRequest $demoRequest): Response
    {
        return Inertia::render('demo-requests/edit', ['inquiry' => $demoRequest, 'tenants' => $this->tenants($request)]);
    }

    /** @return Collection<int, Tenant>|array{} */
    private function tenants(Request $request): Collection|array
    {
        return $request->user()->hasPermission('tenants.manage') ? Tenant::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email']) : [];
    }

    public function adminStore(Request $request): RedirectResponse
    {
        $data = $request->validate($this->contactRules('required') + $this->followUpRules());
        abort_if(! empty($data['tenant_id']) && ! $request->user()->hasPermission('tenants.manage'), 403);
        $inquiry = DemoRequest::create($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demo request created.']);

        return to_route('demo-requests.show', $inquiry);
    }

    /** @return array<string, list<string|In>> */
    private function contactRules(string $presence): array
    {
        return ['name' => [$presence, 'required', 'string', 'max:120'], 'email' => [$presence, 'required', 'email', 'max:255'],
            'company' => [$presence, 'required', 'string', 'max:160'], 'team_size' => [$presence, 'required', Rule::in(['1-5', '6-20', '21-50', '51+'])],
            'message' => ['nullable', 'string', 'max:2000']];
    }

    /** @return array<string, list<string|In>> */
    private function followUpRules(): array
    {
        return ['status' => ['required', Rule::in(self::STATUSES)], 'follow_up_at' => ['nullable', 'date'],
            'walkthrough_at' => ['required_if:status,scheduled', 'nullable', 'date'], 'notes' => ['nullable', 'string', 'max:10000'],
            'tenant_id' => ['required_if:status,converted', 'nullable', 'integer', 'exists:tenants,id']];
    }

    public function destroy(DemoRequest $demoRequest): RedirectResponse
    {
        $demoRequest->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Request deleted. You can restore it from Deleted requests.']);

        return to_route('demo-requests.index');
    }

    public function restore(DemoRequest $demoRequest): RedirectResponse
    {
        $demoRequest->restore();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Request restored.']);

        return to_route('demo-requests.index');
    }

    public function update(Request $request, DemoRequest $demoRequest): RedirectResponse
    {
        $data = $request->validate($this->contactRules('sometimes') + $this->followUpRules());
        $data['tenant_id'] = isset($data['tenant_id']) ? (int) $data['tenant_id'] : null;
        if ($data['tenant_id'] !== $demoRequest->tenant_id) {
            abort_unless($request->user()->hasPermission('tenants.manage'), 403);
        }
        $demoRequest->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Request follow-up saved.']);

        return to_route('demo-requests.show', $demoRequest);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'company' => ['required', 'string', 'max:160'],
            'team_size' => ['required', Rule::in(['1-5', '6-20', '21-50', '51+'])],
            'message' => ['nullable', 'string', 'max:2000'],
            'website' => ['nullable', 'max:0'],
        ]);
        unset($data['website']);
        DemoRequest::create($data);

        return to_route('home');
    }
}
