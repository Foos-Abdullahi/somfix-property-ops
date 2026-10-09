<?php

use App\Models\User;
use Database\Seeders\ProductionAdminSeeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

beforeEach(function () {
    config([
        'seeders.admin.name' => 'Production Administrator',
        'seeders.admin.email' => 'admin@somfix.so',
        'seeders.admin.password' => 'test-only-production-password',
    ]);
});

it('creates an active verified production administrator', function () {
    $this->seed(ProductionAdminSeeder::class);

    $admin = User::where('email', 'admin@somfix.so')->sole();

    expect($admin->is_active)->toBeTrue()
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and($admin->role->slug)->toBe('administrator')
        ->and(Hash::check('test-only-production-password', $admin->password))->toBeTrue();
});

it('preserves an existing administrators password on subsequent deployments', function () {
    $this->seed(ProductionAdminSeeder::class);
    $password = User::where('email', 'admin@somfix.so')->sole()->password;
    config(['seeders.admin.password' => 'different-test-only-password']);

    $this->seed(ProductionAdminSeeder::class);

    expect(User::where('email', 'admin@somfix.so')->count())->toBe(1)
        ->and(User::where('email', 'admin@somfix.so')->sole()->password)->toBe($password);
});

it('refuses to elevate an existing non-administrator', function () {
    $user = User::factory()->create(['email' => 'admin@somfix.so']);
    $roleId = $user->role_id;
    $password = $user->password;

    expect(fn () => $this->seed(ProductionAdminSeeder::class))
        ->toThrow(RuntimeException::class);

    expect($user->refresh()->role_id)->toBe($roleId)
        ->and($user->password)->toBe($password);
});
