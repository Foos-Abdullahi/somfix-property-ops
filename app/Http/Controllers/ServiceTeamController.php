<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceTeamRequest;
use App\Http\Requests\UpdateServiceTeamRequest;
use App\Models\ServiceTeam;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceTeamController extends Controller
{
    /**
     * Display the service team register.
     */
    public function index(): Response
    {
        $serviceTeams = ServiceTeam::query()
            ->latest()
            ->get();

        return Inertia::render('service-team/index', [
            'serviceTeams' => $serviceTeams,
            'stats' => [
                'totalMembers' => $serviceTeams->count(),
                'activeMembers' => $serviceTeams->where('status', 'active')->count(),
                'onLeave' => $serviceTeams->where('status', 'on_leave')->count(),
            ],
        ]);
    }

    /**
     * Show the service team creation form.
     */
    public function create(): Response
    {
        return Inertia::render('service-team/create');
    }

    /**
     * Store a newly created service team member.
     */
    public function store(StoreServiceTeamRequest $request): RedirectResponse
    {
        $serviceTeam = ServiceTeam::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Service team member created successfully.',
        ]);

        return to_route('service-team.show', $serviceTeam);
    }

    /**
     * Display the specified service team member.
     */
    public function show(ServiceTeam $serviceTeam): Response
    {
        return Inertia::render('service-team/show', [
            'serviceTeam' => $serviceTeam,
        ]);
    }

    /**
     * Show the service team edit form.
     */
    public function edit(ServiceTeam $serviceTeam): Response
    {
        return Inertia::render('service-team/edit', [
            'serviceTeam' => $serviceTeam,
        ]);
    }

    /**
     * Update the specified service team member.
     */
    public function update(UpdateServiceTeamRequest $request, ServiceTeam $serviceTeam): RedirectResponse
    {
        $serviceTeam->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Service team member updated successfully.',
        ]);

        return to_route('service-team.show', $serviceTeam);
    }

    /**
     * Remove the specified service team member.
     */
    public function destroy(ServiceTeam $serviceTeam): RedirectResponse
    {
        $serviceTeam->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Service team member deleted successfully.',
        ]);

        return to_route('service-team.index');
    }
}
