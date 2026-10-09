<?php

use App\Models\DemoRequest;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('serves the public landing page', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

it('stores a valid demo inquiry without creating a user account', function () {
    $data = ['name' => 'Demo Visitor', 'email' => 'visitor@example.com', 'company' => 'Example Property Team', 'team_size' => '6-20', 'message' => 'We would like to connect our maintenance teams.', 'website' => ''];
    $this->post('/demo-requests', $data)->assertSessionHasNoErrors()->assertRedirect('/');
    $this->assertDatabaseHas('demo_requests', ['email' => $data['email'], 'company' => $data['company']]);
    $this->assertDatabaseMissing('users', ['email' => $data['email']]);
});

it('validates inquiry details and rejects the honeypot', function () {
    $this->post('/demo-requests', ['email' => 'invalid', 'team_size' => 'anything'])->assertSessionHasErrors(['name', 'email', 'company', 'team_size']);
    $this->post('/demo-requests', ['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Company', 'team_size' => '1-5', 'website' => 'spam'])->assertSessionHasErrors('website');
    $this->assertDatabaseCount('demo_requests', 0);
});

it('rate limits public inquiry submissions', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->post('/demo-requests', [])->assertSessionHasErrors();
    }
    $this->post('/demo-requests', [])->assertStatus(429);
});

it('protects the inquiry inbox from guests and unauthorized staff', function () {
    $this->get('/demo-requests')->assertRedirect('/login');
    $role = new Role(['name' => 'No inquiry access', 'permissions' => []]);
    $role->slug = 'no-inquiry-access';
    $role->save();
    $this->actingAs(User::factory()->create(['role_id' => $role->id]))->get('/demo-requests')->assertForbidden();
});

it('lets administrators track a walkthrough and validates its outcome', function () {
    $admin = User::factory()->create(['role_id' => Role::where('slug', 'administrator')->value('id')]);
    $inquiry = DemoRequest::create(['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Example', 'team_size' => '1-5']);
    $this->actingAs($admin)->get('/demo-requests')->assertOk()->assertInertia(fn (Assert $page) => $page->component('demo-requests/index')->has('requests.data', 1));
    $this->get('/demo-requests/'.$inquiry->id)->assertOk();
    $this->put('/demo-requests/'.$inquiry->id, ['status' => 'scheduled'])->assertSessionHasErrors('walkthrough_at');
    $this->put('/demo-requests/'.$inquiry->id, ['status' => 'converted'])->assertSessionHasErrors('tenant_id');
    $this->put('/demo-requests/'.$inquiry->id, ['status' => 'scheduled', 'walkthrough_at' => '2026-10-15T10:00:00Z', 'notes' => 'Agreed by email.'])->assertSessionHasNoErrors()->assertRedirect();
    expect($inquiry->fresh()->status)->toBe('scheduled');
    $this->put('/demo-requests/'.$inquiry->id, ['status' => 'completed', 'notes' => 'Walkthrough finished.'])->assertSessionHasNoErrors();
    expect($inquiry->fresh()->status)->toBe('completed');
});

it('keeps viewing permission separate from follow-up permission', function () {
    $role = new Role(['name' => 'Inquiry reader', 'permissions' => ['demo-requests.view']]);
    $role->slug = 'inquiry-reader';
    $role->save();
    $user = User::factory()->create(['role_id' => $role->id]);
    $inquiry = DemoRequest::create(['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Example', 'team_size' => '1-5']);
    $this->actingAs($user)->get('/demo-requests/'.$inquiry->id)->assertOk()->assertInertia(fn (Assert $page) => $page->has('tenants', 0));
    $this->put('/demo-requests/'.$inquiry->id, ['status' => 'closed'])->assertForbidden();
    expect($inquiry->fresh()->status)->toBe('new');
});

it('links a successful request to a tenant and prevents unauthorized tenant linking', function () {
    $tenant = Tenant::factory()->create();
    $inquiry = DemoRequest::create(['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Example', 'team_size' => '1-5']);
    $role = new Role(['name' => 'Inquiry manager', 'permissions' => ['demo-requests.view', 'demo-requests.manage']]);
    $role->slug = 'inquiry-manager';
    $role->save();
    $this->actingAs(User::factory()->create(['role_id' => $role->id]))->put('/demo-requests/'.$inquiry->id, ['status' => 'converted', 'tenant_id' => $tenant->id])->assertForbidden();
    $admin = User::factory()->create(['role_id' => Role::where('slug', 'administrator')->value('id')]);
    $this->actingAs($admin)->put('/demo-requests/'.$inquiry->id, ['status' => 'converted', 'tenant_id' => (string) $tenant->id])->assertSessionHasNoErrors()->assertRedirect();
    expect($inquiry->fresh()->tenant_id)->toBe($tenant->id);
    expect($inquiry->fresh()->status)->toBe('converted');
});

it('supports the administrator create edit delete and restore lifecycle', function () {
    $admin = User::factory()->create(['role_id' => Role::where('slug', 'administrator')->value('id')]);
    $this->actingAs($admin)->get('/demo-requests/create')->assertOk();
    $data = ['name' => 'Admin Inquiry', 'email' => 'admin-inquiry@example.com', 'company' => 'Company', 'team_size' => '6-20', 'status' => 'new'];
    $this->post('/demo-requests/admin', $data)->assertSessionHasNoErrors()->assertRedirect();
    $inquiry = DemoRequest::where('email', $data['email'])->firstOrFail();
    $this->get('/demo-requests/'.$inquiry->id.'/edit')->assertOk();
    $this->put('/demo-requests/'.$inquiry->id, [...$data, 'name' => 'Updated Inquiry'])->assertSessionHasNoErrors();
    expect($inquiry->fresh()->name)->toBe('Updated Inquiry');
    $this->delete('/demo-requests/'.$inquiry->id)->assertRedirect('/demo-requests');
    $this->assertSoftDeleted($inquiry);
    $this->get('/demo-requests')->assertInertia(fn (Assert $page) => $page->has('requests.data', 0));
    $this->get('/demo-requests?archived=1')->assertInertia(fn (Assert $page) => $page->has('requests.data', 1));
    $this->patch('/demo-requests/'.$inquiry->id.'/restore')->assertRedirect('/demo-requests');
    expect(DemoRequest::find($inquiry->id))->not->toBeNull();
});

it('denies create edit delete and restore to inquiry readers', function () {
    $role = new Role(['name' => 'CRUD reader', 'permissions' => ['demo-requests.view']]);
    $role->slug = 'crud-reader';
    $role->save();
    $inquiry = DemoRequest::create(['name' => 'Visitor', 'email' => 'visitor@example.com', 'company' => 'Example', 'team_size' => '1-5']);
    $this->actingAs(User::factory()->create(['role_id' => $role->id]));
    $this->get('/demo-requests/create')->assertForbidden();
    $this->get('/demo-requests/'.$inquiry->id.'/edit')->assertForbidden();
    $this->post('/demo-requests/admin', [])->assertForbidden();
    $this->delete('/demo-requests/'.$inquiry->id)->assertForbidden();
    $inquiry->delete();
    $this->patch('/demo-requests/'.$inquiry->id.'/restore')->assertForbidden();
});
