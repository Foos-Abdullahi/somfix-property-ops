<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProductionAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('seeders.admin.email');

        if (! is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new RuntimeException('ADMIN_EMAIL must contain a valid email address.');
        }

        $existing = User::where('email', strtolower(trim($email)))->first();

        if ($existing !== null) {
            if (! $existing->is_active || $existing->role?->slug !== 'administrator') {
                throw new RuntimeException('The configured email belongs to an existing non-administrator or inactive account. Choose a new administrator email.');
            }

            // Repeated deployments must preserve an existing administrator's password.
            return;
        }

        $this->call(AdminUserSeeder::class);
    }
}
