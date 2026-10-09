<?php

namespace App\Http\Controllers;

use App\Models\DemoRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DemoRequestController extends Controller
{
    public const STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'converted', 'closed'];

    public function index(Request $request): Response
    {
        $filters = $request->validate(['status' => ['nullable', Rule::in(self::STATUSES)], 'search' => ['nullable', 'string', 'max:120']]);
        $query = DemoRequest::query()->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')->orWhere('company', 'like', '%'.$search.'%');
            }));

        return Inertia::render('demo-requests/index', ['requests' => $query->latest()->paginate(20)->withQueryString(), 'filters' => $filters]);
    }

    public function show(Request $request, DemoRequest $demoRequest): Response
    {
        return Inertia::render('demo-requests/show', [
            'inquiry' => $demoRequest->load('tenant:id,first_name,last_name'),
            'tenants' => $request->user()->hasPermission('tenants.manage') ? Tenant::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email']) : [],
        ]);
    }

    public function update(Request $request, DemoRequest $demoRequest): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'follow_up_at' => ['nullable', 'date'],
            'walkthrough_at' => ['required_if:status,scheduled', 'nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'tenant_id' => ['required_if:status,converted', 'nullable', 'integer', 'exists:tenants,id'],
        ]);
        $data['tenant_id'] = isset($data['tenant_id']) ? (int) $data['tenant_id'] : null;
        if ($data['tenant_id'] !== $demoRequest->tenant_id) {
            abort_unless($request->user()->hasPermission('tenants.manage'), 403);
        }
        $demoRequest->update($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Request follow-up saved.']);

        return to_route('demo-requests.show', $demoRequest);
    }

    public function store(Request $request)
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
