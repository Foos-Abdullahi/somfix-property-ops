<?php

use App\Models\ServiceTeam;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

test('tenant import skips existing and in-file duplicates and invalid rows', function () {
    Tenant::factory()->create(['phone' => '+252 61 1234567', 'email' => 'existing@example.com']);
    $csv = "first_name,last_name,phone,email\nAyaan,Ali,00252611234567,new@example.com\nHawa,Ali,+252619999999,hawa@example.com\nHawa,Ali,+252 61 9999999,other@example.com\nBad,Email,+252618888888,invalid\n";
    $this->actingAs(User::factory()->create())->postJson(route('tenants.import'), [
        'file' => UploadedFile::fake()->createWithContent('tenants.csv', $csv),
    ])->assertOk()->assertJsonPath('imported', 1)->assertJsonPath('duplicates', 2)->assertJsonPath('invalid', 1);
    expect(Tenant::count())->toBe(2);
    $this->assertDatabaseHas('tenants', ['first_name' => 'Hawa', 'status' => 'active']);
    $this->actingAs(User::factory()->create())->postJson(route('tenants.import'), [
        'file' => UploadedFile::fake()->createWithContent('tenants.csv', $csv),
    ])->assertOk()->assertJsonPath('imported', 0)->assertJsonPath('duplicates', 3);
});

test('service team accepts Excel and normalizes email and status', function () {
    $path = tempnam(storage_path('framework/testing'), 'import');
    unlink($path);
    $writer = new Writer;
    $writer->openToFile($path);
    $writer->addRow(Row::fromValues(['Name', 'Specialization', 'Phone', 'Email', 'Status']));
    $writer->addRow(Row::fromValues(['Ali', 'Plumbing', '+252610123456', 'ALI@example.com', 'On Leave']));
    $writer->close();
    try {
        $this->actingAs(User::factory()->create())->postJson(route('service-team.import'), [
            'file' => new UploadedFile($path, 'team.xlsx', null, null, true),
        ])->assertOk()->assertJsonPath('imported', 1);
        $this->assertDatabaseHas('service_teams', ['name' => 'Ali', 'email' => 'ali@example.com', 'status' => 'on_leave']);
    } finally {
        if (file_exists($path)) {
            unlink($path);
        }
    }
});

test('malformed files and wrong headers do not create records', function () {
    $this->actingAs(User::factory()->create());
    foreach (['team.csv' => "name,phone\nAli,123\n", 'team.xlsx' => 'broken file'] as $name => $content) {
        $this->postJson(route('service-team.import'), ['file' => UploadedFile::fake()->createWithContent($name, $content)])
            ->assertUnprocessable()->assertJsonValidationErrors('file');
    }
    expect(ServiceTeam::count())->toBe(0);
});

test('imports require authentication and templates are downloadable', function () {
    $this->postJson(route('tenants.import'))->assertUnauthorized();
    $this->actingAs(User::factory()->create())->get(route('tenants.import-template'))
        ->assertOk()->assertDownload('tenants-import-template.csv');
});

test('invalid unit references are rejected while valid rows import', function () {
    $this->actingAs(User::factory()->create())->postJson(route('tenants.import'), [
        'file' => UploadedFile::fake()->createWithContent('tenants.csv', "first_name,last_name,phone,unit_id,move_in_date\nAli,Ahmed,12345,999999,2026-10-01\nHawa,Ahmed,67890,,2026-10-01\n"),
    ])->assertOk()->assertJsonPath('imported', 1)->assertJsonPath('invalid', 1);
});
