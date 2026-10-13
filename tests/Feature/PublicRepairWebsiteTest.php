<?php

use App\Models\RepairRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('serves all public service pages without authentication', function () {
    foreach (['services', 'property-management', 'maintenance-plans', 'how-it-works', 'about', 'faq', 'contact'] as $slug) {
        $this->get('/'.$slug)->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome')->where('publicPage', $slug));
    }
    $this->get('/maintenance')->assertRedirect('/login');
});

it('stores a repair request and private customer photo', function () {
    Storage::fake('local');
    $this->post('/repair-requests', ['name' => 'Amina', 'phone' => '0612345678', 'area' => 'KM4', 'service' => 'Plumbing', 'message' => 'Leaking tap', 'photo' => UploadedFile::fake()->image('tap.jpg')])->assertSessionHasNoErrors()->assertRedirect('/contact');
    $this->assertDatabaseHas('repair_requests', ['name' => 'Amina', 'service' => 'Plumbing']);
    $repair = RepairRequest::firstOrFail();
    Storage::disk('local')->assertExists($repair->photo_path);
    $this->get('/repair-requests')->assertRedirect('/login');
    $this->get('/repair-requests/'.$repair->id.'/photo')->assertRedirect('/login');
});

it('rejects invalid services, spam and unsafe uploads', function () {
    $this->post('/repair-requests', ['name' => 'Visitor', 'phone' => '0612345678', 'service' => 'Fake', 'website' => 'spam', 'photo' => UploadedFile::fake()->create('test.pdf')])->assertSessionHasErrors(['service', 'website', 'photo']);
    $this->assertDatabaseCount('repair_requests', 0);
});

it('allows maintenance staff to read inquiries and prevents unrelated staff access', function () {
    Storage::fake('local');
    Storage::disk('local')->put('repair-requests/photo.jpg', 'photo');
    $repair = RepairRequest::create(['name' => 'Amina', 'phone' => '0612345678', 'service' => 'Plumbing', 'photo_path' => 'repair-requests/photo.jpg']);
    $role = new Role(['name' => 'Maintenance reader', 'permissions' => ['maintenance.view']]);
    $role->slug = 'repair-reader';
    $role->save();
    $user = User::factory()->create(['role_id' => $role->id]);
    $this->actingAs($user)->get('/repair-requests')->assertOk()->assertInertia(fn (Assert $page) => $page->component('repair-requests/index')->has('requests.data', 1));
    $this->get('/repair-requests/'.$repair->id.'/photo')->assertOk();
    $role->update(['permissions' => []]);
    $user->unsetRelation('role');
    $this->get('/repair-requests')->assertForbidden();
    $this->get('/repair-requests/'.$repair->id.'/photo')->assertForbidden();
});

it('rate limits public repair requests', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->post('/repair-requests', [])->assertSessionHasErrors();
    }
    $this->post('/repair-requests', [])->assertStatus(429);
});
