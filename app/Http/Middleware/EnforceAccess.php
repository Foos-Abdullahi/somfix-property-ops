<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnforceAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }
        if (! $user->is_active) {
            $message = 'This account is inactive. Contact your administrator.';

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/login')->withErrors(['email' => $message]);
        }

        if ($user->role?->slug === 'standard-user') {
            $routeName = $request->route()?->getName() ?? '';
            $isPublicRoute = $routeName === 'home' || str_starts_with($routeName, 'public.');

            if (! $isPublicRoute && ! str_starts_with($routeName, 'account.') && ! str_starts_with($routeName, 'my-requests.') && ! in_array($routeName, ['profile.edit', 'profile.update', 'profile.destroy', 'security.edit', 'user-password.update', 'logout'], true)) {
                return redirect()->route('account.show');
            }
        }
        $name = $request->route()?->getName() ?? '';
        [$module, $action] = array_pad(explode('.', $name, 2), 2, '');
        if (array_key_exists($module.'.view', config('permissions'))) {
            $isView = in_array($action, ['index', 'show', 'print'])
                || str_ends_with($action, '.index')
                || str_ends_with($action, '.show')
                || str_ends_with($action, '.print');
            $permission = $module.($isView ? '.view' : '.manage');
            abort_unless($user->hasPermission($permission), 403);
        }

        return $next($request);
    }
}
