<?php

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

function accessAdmin(): User
{
    return User::factory()->create(['role_id' => Role::where('slug', 'administrator')->sole()->id]);
}

it('serves dedicated user and role forms with protected edit routes', function () {
    $admin = accessAdmin();
    $staff = User::factory()->create();
    $role = Role::where('slug', 'viewer')->sole();
    $this->actingAs($admin)->get('/settings/users/create')->assertOk()->assertInertia(fn (Assert $page) => $page->component('users/form')->where('user', null));
    $this->get('/settings/users/'.$staff->id.'/edit')->assertOk()->assertInertia(fn (Assert $page) => $page->component('users/form')->where('user.id', $staff->id));
    $this->get('/settings/roles/create')->assertOk()->assertInertia(fn (Assert $page) => $page->component('roles/form')->where('role', null));
    $this->get('/settings/roles/'.$role->id.'/edit')->assertOk()->assertInertia(fn (Assert $page) => $page->component('roles/form')->where('role.id', $role->id));
    $this->get('/settings/roles/'.$admin->role_id.'/edit')->assertForbidden();
    $this->actingAs($staff)->get('/settings/users/create')->assertForbidden();
    $this->get('/settings/roles/create')->assertForbidden();
});

it('shows record names for account activity and preserves names after deletion', function () {
    $admin = accessAdmin();
    $staff = User::factory()->create(['name' => 'Named Staff']);
    $this->actingAs($admin);
    $staff->forceFill(['is_active' => false])->save();
    $log = AuditLog::where('subject_type', 'User')->where('subject_id', $staff->id)->where('action', 'updated')->latest('id')->firstOrFail();
    $staff->delete();
    expect($log->fresh()->record_name)->toBe('Named Staff');
    $this->get('/settings/audit-log/'.$log->id)->assertOk()->assertInertia(fn (Assert $page) => $page->where('log.record_name', 'Named Staff'));
    $login = new AuditLog(['subject_type' => 'User', 'subject_id' => $staff->id, 'actor_name' => 'Named Staff', 'action' => 'login']);
    expect($login->record_name)->toBe('Named Staff');
});

it('restricts all administration pages and mutations', function () {
    $this->actingAs(User::factory()->create());
    foreach (['users', 'roles', 'audit-log'] as $page) {
        $this->get('/settings/'.$page)->assertForbidden();
    }
    $this->post('/settings/users', [])->assertForbidden();
    $this->post('/settings/roles', [])->assertForbidden();
});

it('creates and updates users with hashed passwords and redacted audit records', function () {
    $admin = accessAdmin();
    $viewer = Role::where('slug', 'viewer')->sole();
    $data = ['name' => 'New Staff', 'email' => 'staff@example.com', 'password' => 'secure-test-password', 'password_confirmation' => 'secure-test-password', 'role_id' => $viewer->id, 'is_active' => true];
    $this->actingAs($admin)->post('/settings/users', $data)->assertSessionHasNoErrors()->assertRedirect('/settings/users');
    $staff = User::where('email', $data['email'])->sole();
    expect(Hash::check($data['password'], $staff->password))->toBeTrue();
    expect($staff->email_verified_at)->not->toBeNull();
    $originalPassword = $staff->password;
    $this->put('/settings/users/'.$staff->id, [...$data, 'name' => 'Updated Staff', 'password' => '', 'password_confirmation' => '', 'is_active' => false])->assertSessionHasNoErrors();
    expect($staff->fresh()->is_active)->toBeFalse();
    expect($staff->fresh()->password)->toBe($originalPassword);
    $log = AuditLog::where('subject_type', 'User')->where('subject_id', $staff->id)->where('action', 'updated')->latest('id')->firstOrFail();
    expect($log->changes['before']['name'])->toBe('New Staff');
    expect($log->changes['after']['name'])->toBe('Updated Staff');
    expect($log->actor_id)->toBe($admin->id);
    $audit = AuditLog::all()->toJson();
    expect($audit)->not->toContain($data['password'])->not->toContain($originalPassword)->not->toContain('remember_token');
});

it('prevents self lockout and administrator deletion', function () {
    $admin = accessAdmin();
    $this->actingAs($admin)->put('/settings/users/'.$admin->id, ['name' => $admin->name, 'email' => $admin->email, 'role_id' => $admin->role_id, 'is_active' => false])->assertSessionHasErrors('role_id');
    $this->delete('/settings/users/'.$admin->id)->assertForbidden();
    $this->delete('/settings/roles/'.$admin->role_id)->assertSessionHasErrors('role');
    expect($admin->fresh()->is_active)->toBeTrue();
});

it('creates roles and enforces their permissions on operational routes', function () {
    $admin = accessAdmin();
    $this->actingAs($admin)->post('/settings/roles', ['name' => 'Property Reader', 'description' => 'Read properties only', 'permissions' => ['properties.view']])->assertSessionHasNoErrors();
    $role = Role::where('name', 'Property Reader')->sole();
    $user = User::factory()->create(['role_id' => $role->id]);
    $this->actingAs($user)->get('/properties')->assertOk();
    $this->get('/properties/create')->assertForbidden();
    $this->post('/properties', [])->assertForbidden();
    $this->get('/finance')->assertForbidden();
    $this->actingAs($admin)->put('/settings/roles/'.$role->id, ['name' => $role->name, 'description' => '', 'permissions' => []])->assertSessionHasNoErrors();
    $this->actingAs($user->fresh())->get('/properties')->assertForbidden();
    $this->actingAs($admin)->delete('/settings/roles/'.$role->id)->assertSessionHasErrors('role');
});

it('blocks inactive accounts at login and revokes authenticated access', function () {
    $user = User::factory()->create(['is_active' => false]);
    $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('email');
    $this->assertGuest();
    $this->actingAs($user)->get('/dashboard')->assertRedirect('/login');
    $this->assertGuest();
});

it('supports user and audit filtering and retains deleted account history', function () {
    $admin = accessAdmin();
    $staff = User::factory()->create(['name' => 'Searchable Staff']);
    $this->actingAs($admin)->get('/settings/users?search=Searchable')->assertOk()->assertInertia(fn (Assert $page) => $page->has('users.data', 1));
    $this->delete('/settings/users/'.$staff->id)->assertSessionHasNoErrors();
    expect(User::find($staff->id))->toBeNull();
    $this->get('/settings/audit-log?action=deleted&search=User')->assertOk()->assertInertia(fn (Assert $page) => $page->has('logs.data', 1)->where('logs.data.0.subject_id', $staff->id));
});

it('prevents delegated managers from escalating privileges', function () {
    $role = new Role(['name' => 'Delegated', 'permissions' => ['users.manage', 'roles.manage']]);
    $role->slug = 'delegated';
    $role->save();
    $manager = User::factory()->create(['role_id' => $role->id]);
    $admin = accessAdmin();
    $this->actingAs($manager)->post('/settings/roles', ['name' => 'Escalated', 'permissions' => ['finance.manage']])->assertForbidden();
    $this->put('/settings/users/'.$admin->id, ['name' => $admin->name, 'email' => $admin->email, 'role_id' => $role->id, 'is_active' => true, 'password' => 'replacement-password', 'password_confirmation' => 'replacement-password'])->assertForbidden();
});

it('renders management pages and accepts an audit end date without a start date', function () {
    $this->actingAs(accessAdmin());
    $this->get('/settings/users')->assertOk()->assertInertia(fn (Assert $page) => $page->component('users/index')->has('roles', 3));
    $this->get('/settings/roles')->assertOk()->assertInertia(fn (Assert $page) => $page->component('roles/index')->has('permissions'));
    $this->get('/settings/audit-log?to='.now()->format('Y-m-d'))->assertOk()->assertSessionHasNoErrors();
});

it('includes view access with manage permission and deletes unused custom roles', function () {
    $this->actingAs(accessAdmin())->post('/settings/roles', ['name' => 'Maintenance Manager', 'permissions' => ['maintenance.manage']])->assertSessionHasNoErrors();
    $role = Role::where('name', 'Maintenance Manager')->sole();
    expect($role->permissions)->toContain('maintenance.view');
    $this->delete('/settings/roles/'.$role->id)->assertSessionHasNoErrors();
    expect(Role::find($role->id))->toBeNull();
});

it('rejects duplicate users and unknown permission keys', function () {
    $admin = accessAdmin();
    $this->actingAs($admin)->post('/settings/users', ['name' => 'Duplicate', 'email' => $admin->email, 'password' => 'secure-test-password', 'password_confirmation' => 'secure-test-password', 'role_id' => $admin->role_id, 'is_active' => true])->assertSessionHasErrors('email');
    $this->post('/settings/roles', ['name' => 'Bad Role', 'permissions' => ['everything']])->assertSessionHasErrors('permissions.0');
});

it('shows protected role and audit detail pages', function () {
    $admin = accessAdmin();
    $role = Role::where('slug', 'viewer')->sole();
    $log = AuditLog::latest('id')->firstOrFail();
    $this->actingAs($admin)->get('/settings/roles/'.$role->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('roles/show')->where('role.id', $role->id)->has('permissions'));
    $this->get('/settings/audit-log/'.$log->id)->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('audit-log/show')->where('log.id', $log->id));
    $this->get('/settings/roles/999999')->assertNotFound();
    $this->get('/settings/audit-log/999999')->assertNotFound();
    $this->actingAs(User::factory()->create())->get('/settings/roles/'.$role->id)->assertForbidden();
    $this->get('/settings/audit-log/'.$log->id)->assertForbidden();
});
