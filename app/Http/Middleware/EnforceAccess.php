<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnforceAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }
        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect('/login')->withErrors(['email' => 'This account is inactive. Contact your administrator.']);
        }
        $name = $request->route()?->getName() ?? '';
        [$module, $action] = array_pad(explode('.', $name, 2), 2, '');
        if (array_key_exists($module.'.view', config('permissions'))) {
            $permission = $module.(in_array($action, ['index', 'show']) ? '.view' : '.manage');
            abort_unless($user->hasPermission($permission), 403);
        }
        return $next($request);
    }
}
