<?php

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

    $service = ServiceCatalog::sole();
    expect($service->price)->toBe('45.00');

    $this->post(route('service-list.store'), ['name' => 'Water tank cleaning', 'category' => 'Plumbing', 'status' => 'active'])
        ->assertSessionHasErrors('name');

    $this->put(route('service-list.update', $service), ['name' => 'Water tank cleaning', 'category' => 'Plumbing', 'status' => 'inactive'])
        ->assertRedirect(route('service-list.show', $service));
    expect($service->fresh()->status)->toBe('inactive');

    $this->get(route('service-list.show', $service))->assertOk();
    $this->delete(route('service-list.destroy', $service))->assertRedirect(route('service-list.index'));
    expect(ServiceCatalog::count())->toBe(0);
});

test('viewers can see the service list but not change it', function () {
    $viewer = User::factory()->create(['role_id' => Role::where('slug', 'viewer')->value('id')]);
    $this->actingAs($viewer)->get(route('service-list.index'))->assertOk();
    $this->actingAs($viewer)->post(route('service-list.store'), ['name' => 'X', 'category' => 'Y', 'status' => 'active'])->assertForbidden();
});

test('services import from Excel and skip duplicate names', function () {
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
