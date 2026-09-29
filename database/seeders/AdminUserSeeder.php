<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $name = config('seeders.admin.name');
        $email = config('seeders.admin.email');
        $password = config('seeders.admin.password');

        if (! is_string($name) || trim($name) === '') {
            throw new RuntimeException('ADMIN_NAME must be set before seeding the admin user.');
        }

        if (! is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new RuntimeException('ADMIN_EMAIL must contain a valid email address.');
        }

        if (! is_string($password) || strlen($password) < 12) {
            throw new RuntimeException('ADMIN_PASSWORD must be at least 12 characters.');
        }

        $email = strtolower(trim($email));
        $admin = User::query()->firstOrNew(['email' => $email]);
        $admin->name = trim($name);
        $admin->role_id = \App\Models\Role::where('slug', 'administrator')->sole()->id;
        $admin->is_active = true;

        // The User model's hashed cast securely hashes the configured password.
        $admin->password = $password;

        if ($admin->email_verified_at === null) {
            $admin->email_verified_at = now();
        }

        $admin->save();
    }
}
