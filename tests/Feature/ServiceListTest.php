<?php

use App\Models\Lead;
use App\Models\RepairRequest;
use App\Models\Role;
use App\Models\ServiceCatalog;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

test('operators can view, create, update and delete services', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('service-list.index'))->assertOk();
    $this->post(route('service-list.store'), [
        'name' => 'Water tank cleaning',
        'category' => 'Plumbing',
        'price' => '45',
        'unit' => 'per tank',
        'status' => 'active',
    ])->assertRedirect();

    $service = ServiceCatalog::where('name', 'Water tank cleaning')->sole();
    expect($service->price)->toBe('45.00');

    $this->post(route('service-list.store'), ['name' => 'Water tank cleaning', 'category' => 'Plumbing', 'status' => 'active'])
        ->assertSessionHasErrors('name');

    $this->put(route('service-list.update', $service), ['name' => 'Water tank cleaning', 'category' => 'Plumbing', 'status' => 'inactive'])
        ->assertRedirect(route('service-list.show', $service));
    expect($service->fresh()->status)->toBe('inactive');

    $this->get(route('service-list.show', $service))->assertOk();
    $this->delete(route('service-list.destroy', $service))->assertRedirect(route('service-list.index'));
    $this->assertDatabaseMissing('service_catalog', ['name' => 'Water tank cleaning']);
});

test('viewers can see the service list but not change it', function () {
    $viewer = User::factory()->create(['role_id' => Role::where('slug', 'viewer')->value('id')]);
    $this->actingAs($viewer)->get(route('service-list.index'))->assertOk();
    $this->actingAs($viewer)->post(route('service-list.store'), ['name' => 'X', 'category' => 'Y', 'status' => 'active'])->assertForbidden();
});

test('services import from Excel and skip duplicate names', function () {
    ServiceCatalog::query()->delete();
    ServiceCatalog::create(['name' => 'AC servicing', 'category' => 'Cooling', 'status' => 'active']);
    $path = tempnam(storage_path('framework/testing'), 'import');
    unlink($path);
    $writer = new Writer;
    $writer->openToFile($path);
    $writer->addRow(Row::fromValues(['Name', 'Category', 'Price', 'Unit', 'Status']));
    $writer->addRow(Row::fromValues(['Electrical wiring', 'Electrical', '1,200', 'per job', 'Active']));
    $writer->addRow(Row::fromValues(['ac  SERVICING', 'Cooling', 30, null, null]));
    $writer->addRow(Row::fromValues(['Painting', '', 10, null, null]));
    $writer->addRow(Row::fromValues(['Electrical Wiring', 'Electrical', null, null, null]));
    $writer->close();
    try {
        $this->actingAs(User::factory()->create())->postJson(route('service-list.import'), [
            'file' => new UploadedFile($path, 'services.xlsx', null, null, true),
        ])->assertOk()->assertJsonPath('imported', 1)->assertJsonPath('duplicates', 2)->assertJsonPath('invalid', 1);
    } finally {
        if (file_exists($path)) {
            unlink($path);
        }
    }
    $this->assertDatabaseHas('service_catalog', ['name' => 'Electrical wiring', 'price' => 1200, 'status' => 'active']);
    expect(ServiceCatalog::count())->toBe(2);
});

test('service list Excel template is downloadable', function () {
    $this->actingAs(User::factory()->create())->get(route('service-list.import-template'))
        ->assertOk()->assertDownload('service-list-import-template.xlsx');
});

test('the service list starts with the website services', function () {
    expect(ServiceCatalog::where('name', 'Plumbing')->value('price'))->toBe('30.00')
        ->and(ServiceCatalog::requestOptions())->toContain('Plumbing', 'Not sure');
});

test('website requests only accept active services and carry the price into the lead', function () {
    ServiceCatalog::where('name', 'Cleaning')->update(['status' => 'inactive']);
    ServiceCatalog::create(['name' => 'Solar panel repair', 'category' => 'Electrical', 'price' => 80, 'status' => 'active']);

    $this->post(route('repair-requests.store'), ['name' => 'Ayaan', 'phone' => '0611111111', 'service' => 'Cleaning'])
        ->assertSessionHasErrors('service');
    $this->post(route('repair-requests.store'), ['name' => 'Ayaan', 'phone' => '0611111111', 'service' => 'Solar panel repair'])
        ->assertSessionHasNoErrors();

    $request = RepairRequest::sole();
    $this->actingAs(User::factory()->create())->post(route('repair-requests.convert', $request))->assertRedirect();

    $lead = Lead::sole();
    expect($lead->service_category)->toBe('Solar panel repair')
        ->and((float) $lead->estimated_value)->toBe(80.0);

    $this->get(route('home'))->assertInertia(fn ($page) => $page->where('serviceOptions', fn ($options) => collect($options)->contains('Solar panel repair') && ! collect($options)->contains('Cleaning')));
});

test('renaming a service keeps requests and leads linked and shows usage', function () {
    $service = ServiceCatalog::where('name', 'Plumbing')->sole();
    RepairRequest::create(['name' => 'Hawa', 'phone' => '0612222222', 'service' => 'Plumbing', 'status' => 'new']);
    Lead::create(['source' => 'phone', 'service_category' => 'Plumbing', 'title' => 'Leak', 'description' => 'Kitchen leak', 'status' => 'new']);

    $this->actingAs(User::factory()->create())
        ->put(route('service-list.update', $service), ['name' => 'Plumbing repair', 'category' => 'Plumbing', 'status' => 'active'])
        ->assertRedirect();

    $this->assertDatabaseHas('repair_requests', ['service' => 'Plumbing repair']);
    $this->assertDatabaseHas('leads', ['service_category' => 'Plumbing repair']);
    $this->get(route('service-list.show', $service))
        ->assertInertia(fn ($page) => $page->where('usage.requests', 1)->where('usage.leads', 1)->where('usage.jobs', 0));
});

test('services accept uploaded images and image links, and removed files are deleted', function () {
    Illuminate\Support\Facades\Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $this->post(route('service-list.store'), [
        'name' => 'Roof repair',
        'category' => 'Building',
        'status' => 'active',
        'images' => ['https://example.com/roof.jpg'],
        'new_images' => [UploadedFile::fake()->image('roof.png')],
    ])->assertRedirect();

    $service = ServiceCatalog::where('name', 'Roof repair')->sole();
    expect($service->images)->toHaveCount(2)->and($service->images[0])->toBe('https://example.com/roof.jpg');
    $stored = $service->images[1];
    Illuminate\Support\Facades\Storage::disk('public')->assertExists(substr($stored, strlen('/storage/')));

    $this->put(route('service-list.update', $service), [
        'name' => 'Roof repair', 'category' => 'Building', 'status' => 'active',
        'images' => ['https://example.com/roof.jpg'],
    ])->assertRedirect();
    Illuminate\Support\Facades\Storage::disk('public')->assertMissing(substr($stored, strlen('/storage/')));

    $this->post(route('service-list.store'), [
        'name' => 'Bad', 'category' => 'X', 'status' => 'active', 'images' => ['javascript:alert(1)'],
    ])->assertSessionHasErrors('images.0');
});
