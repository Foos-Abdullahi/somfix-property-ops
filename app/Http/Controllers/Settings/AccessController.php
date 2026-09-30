<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AccessController extends Controller
{
    public function createUser(Request $request)
    {
        return $this->userForm($request);
    }

    public function editUser(Request $request, User $user)
    {
        if ($request->user()->role?->slug !== 'administrator') {
            abort_if($user->role?->slug === 'administrator', 403);
            abort_if(array_diff($user->role?->permissions ?? [], $request->user()->role?->permissions ?? []) !== [], 403);
        }

        return $this->userForm($request, $user);
    }

    private function userForm(Request $request, ?User $user = null)
    {
        return Inertia::render('users/form', [
            'user' => $user,
            'self' => $user?->id === $request->user()->id,
            'roles' => Role::orderBy('name')->get()->filter(fn ($role) => $request->user()->role?->slug === 'administrator' || ($role->slug !== 'administrator' && array_diff($role->permissions, $request->user()->role?->permissions ?? []) === []))->values(),
        ]);
    }

    public function createRole(Request $request)
    {
        return $this->roleForm($request);
    }

    public function editRole(Request $request, Role $role)
    {
        abort_if($role->slug === 'administrator' || $request->user()->role_id === $role->id, 403);
        foreach ($role->permissions as $permission) {
            abort_unless($request->user()->hasPermission($permission), 403);
        }

        return $this->roleForm($request, $role);
    }

    private function roleForm(Request $request, ?Role $role = null)
    {
        return Inertia::render('roles/form', [
            'role' => $role,
            'permissions' => config('permissions'),
            'grantable' => array_values(array_filter(array_keys(config('permissions')), fn ($key) => $request->user()->hasPermission($key))),
        ]);
    }

    public function showRole(Role $role)
    {
        return Inertia::render('roles/show', ['role' => $role->load(['users' => fn ($query) => $query->select('id', 'role_id', 'name')->orderBy('name')])->loadCount('users'), 'permissions' => config('permissions')]);
    }

    public function showAudit(AuditLog $auditLog)
    {
        return Inertia::render('audit-log/show', ['log' => $auditLog]);
    }

    public function users(Request $request)
    {
        $filters = $request->validate(['search' => 'nullable|string|max:100', 'status' => 'nullable|in:active,inactive', 'role' => 'nullable|integer']);

        return Inertia::render('users/index', [
            'stats' => ['total' => User::count(), 'active' => User::where('is_active', true)->count(), 'inactive' => User::where('is_active', false)->count(), 'roles' => Role::count()],
            'users' => User::query()->with('role:id,name,slug')
                ->when($filters['search'] ?? null, fn ($query, $term) => $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))
                ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('is_active', $status === 'active'))
                ->when($filters['role'] ?? null, fn ($q, $role) => $q->where('role_id', $role))
                ->orderBy('name')->paginate(15)->withQueryString(),
            'roles' => Role::orderBy('name')->get(),
            'filters' => $filters,
            'currentUserId' => $request->user()->id,
            'isAdministrator' => $request->user()->role?->slug === 'administrator',
        ]);
    }

    private function userData(Request $request, ?User $user = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:12', 'confirmed'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'is_active' => ['required', 'boolean'],
        ]);
        $role = Role::findOrFail($data['role_id']);
        if ($request->user()->role?->slug !== 'administrator') {
            abort_if($role->slug === 'administrator' || $user?->role?->slug === 'administrator', 403);
            abort_if(array_diff($role->permissions, $request->user()->role?->permissions ?? []) !== [], 403);
            if ($user) {
                abort_if(array_diff($user->role?->permissions ?? [], $request->user()->role?->permissions ?? []) !== [], 403);
            }
        }
        if ($user?->id === $request->user()->id && (! $data['is_active'] || (int) $data['role_id'] !== $user->role_id)) {
            throw ValidationException::withMessages(['role_id' => 'You cannot deactivate yourself or change your own role.']);
        }

        return $data;
    }

    public function storeUser(Request $request)
    {
        $data = $this->userData($request);
        DB::transaction(function () use ($data) {
            $user = new User;
            $user->forceFill($data);
            $user->email_verified_at = now();
            $user->save();
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created.']);

        return to_route('settings.users.index');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $this->userData($request, $user);
        DB::transaction(function () use ($user, $data) {
            // Serialize administrator membership changes to preserve at least one active administrator.
            $administrator = Role::where('slug', 'administrator')->lockForUpdate()->sole();
            if ($user->role_id === $administrator->id && $user->is_active && (! $data['is_active'] || (int) $data['role_id'] !== $administrator->id)) {
                if (User::where('role_id', $administrator->id)->where('is_active', true)->count() <= 1) {
                    throw ValidationException::withMessages(['role_id' => 'At least one active administrator is required.']);
                }
            }
            if (empty($data['password'])) {
                unset($data['password']);
            } else {
                $user->remember_token = null;
            }
            $user->forceFill($data)->save();
            if (! $user->is_active || isset($data['password'])) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated.']);

        return to_route('settings.users.index');
    }

    public function destroyUser(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id || $user->role?->slug === 'administrator', 403);
        if ($request->user()->role?->slug !== 'administrator') {
            abort_if(array_diff($user->role?->permissions ?? [], $request->user()->role?->permissions ?? []) !== [], 403);
        }
        DB::transaction(function () use ($user) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted.']);

        return back();
    }

    public function roles(Request $request)
    {
        return Inertia::render('roles/index', [
            'roles' => Role::with(['users' => fn ($query) => $query->select('id', 'role_id', 'name')->orderBy('name')])->withCount('users')->orderBy('name')->get(),
            'permissions' => config('permissions'),
            'grantablePermissions' => array_values(array_filter(array_keys(config('permissions')), fn ($key) => $request->user()->hasPermission($key))),
        ]);
    }

    private function roleData(Request $request, ?Role $role = null): array
    {
        abort_if($role?->slug === 'administrator', 403);
        if ($role && $request->user()->role_id === $role->id) {
            throw ValidationException::withMessages(['name' => 'You cannot edit your own role. Ask another administrator.']);
        }
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('roles')->ignore($role)],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'distinct', Rule::in(array_keys(config('permissions')))],
        ]);
        foreach ($data['permissions'] as $permission) {
            $view = str_replace('.manage', '.view', $permission);
            if (array_key_exists($view, config('permissions'))) {
                $data['permissions'][] = $view;
            }
        }
        $data['permissions'] = array_values(array_unique($data['permissions']));
        foreach (array_unique([...$data['permissions'], ...($role?->permissions ?? [])]) as $permission) {
            abort_unless($request->user()->hasPermission($permission), 403);
        }

        return $data;
    }

    public function storeRole(Request $request)
    {
        $data = $this->roleData($request);
        DB::transaction(function () use ($data) {
            $role = new Role($data);
            $role->slug = Str::uuid()->toString();
            $role->save();
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role created.']);

        return to_route('settings.roles.index');
    }

    public function updateRole(Request $request, Role $role)
    {
        $data = $this->roleData($request, $role);
        DB::transaction(fn () => $role->update($data));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated.']);

        return to_route('settings.roles.index');
    }

    public function destroyRole(Request $request, Role $role)
    {
        if ($role->is_system || $role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'System roles and roles assigned to users cannot be deleted.']);
        }
        foreach ($role->permissions as $permission) {
            abort_unless($request->user()->hasPermission($permission), 403);
        }
        DB::transaction(fn () => $role->delete());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted.']);

        return back();
    }

    public function audit(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:100', 'action' => 'nullable|in:created,updated,deleted,login,logout',
            'from' => 'nullable|date', 'to' => ['nullable', 'date', ...($request->filled('from') ? ['after_or_equal:from'] : [])],
        ]);

        return Inertia::render('audit-log/index', [
            'stats' => ['total' => AuditLog::count(), 'today' => AuditLog::whereDate('created_at', today())->count(), 'changes' => AuditLog::whereIn('action', ['created', 'updated', 'deleted'])->count(), 'signIns' => AuditLog::where('action', 'login')->count()],
            'logs' => AuditLog::query()
                ->when($filters['search'] ?? null, fn ($q, $term) => $q->where(fn ($q) => $q->where('actor_name', 'like', "%{$term}%")->orWhere('subject_type', 'like', "%{$term}%")->orWhere('subject_id', $term)))
                ->when($filters['action'] ?? null, fn ($q, $value) => $q->where('action', $value))
                ->when($filters['from'] ?? null, fn ($q, $value) => $q->whereDate('created_at', '>=', $value))
                ->when($filters['to'] ?? null, fn ($q, $value) => $q->whereDate('created_at', '<=', $value))
                ->latest('id')->paginate(20)->withQueryString(),
            'filters' => $filters,
        ]);
    }
}
