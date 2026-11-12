<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    private const TABS = ['profile', 'security', 'requests'];

    public function show(Request $request): Response
    {
        $tab = (string) $request->query('tab', 'profile');
        if (! in_array($tab, self::TABS, true)) {
            $tab = 'profile';
        }

        $user = $request->user();

        return Inertia::render('account/index', [
            'activeTab' => $tab,
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'bio' => $user->bio,
                'member_since' => $user->created_at?->toIso8601String(),
            ],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'requestStats' => [
                'total' => $user->repairRequests()->count(),
                'open' => $user->repairRequests()->where('status', 'new')->count(),
                'in_progress' => $user->repairRequests()->where('status', 'converted')->count(),
            ],
            'requests' => $tab === 'requests'
                ? $user->repairRequests()
                    ->latest()
                    ->paginate(10)
                    ->withQueryString()
                    ->through(fn (RepairRequest $repair) => [
                        'id' => $repair->id,
                        'service' => $repair->service,
                        'area' => $repair->area,
                        'message' => $repair->message,
                        'status' => $repair->status,
                        'created_at' => $repair->created_at?->toIso8601String(),
                        'photo_url' => $repair->photo_path ? route('my-requests.photo', $repair) : null,
                    ])
                : null,
        ]);
    }
}
