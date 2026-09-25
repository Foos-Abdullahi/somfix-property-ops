<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

it('creates a verified admin user with the configured password', function () {
    config([
        'seeders.admin.name' => 'System Administrator',
        'seeders.admin.email' => 'admin@example.com',
        'seeders.admin.password' => 'correct-horse-battery-staple',
    ]);

    (new AdminUserSeeder)->run();

    $admin = User::query()->where('email', 'admin@example.com')->sole();

    expect($admin->name)->toBe('System Administrator');
    expect($admin->email_verified_at)->not->toBeNull();
    expect(Hash::check('correct-horse-battery-staple', $admin->password))->toBeTrue();
});

it('does not create duplicate admin users when run again', function () {
    config([
        'seeders.admin.name' => 'System Administrator',
        'seeders.admin.email' => 'admin@example.com',
        'seeders.admin.password' => 'correct-horse-battery-staple',
    ]);

    (new AdminUserSeeder)->run();
    (new AdminUserSeeder)->run();

    expect(User::query()->where('email', 'admin@example.com')->count())->toBe(1);
});

it('rejects an empty admin password without creating a user', function () {
    config([
        'seeders.admin.name' => 'System Administrator',
        'seeders.admin.email' => 'admin@example.com',
        'seeders.admin.password' => '',
    ]);

    expect(fn () => (new AdminUserSeeder)->run())
        ->toThrow(RuntimeException::class, 'ADMIN_PASSWORD must be at least 12 characters.');

    expect(User::query()->count())->toBe(0);
});
