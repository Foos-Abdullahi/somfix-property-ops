<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Start the service list with the services already offered on the
     * website, so requests, leads and the list share the same names.
     */
    public function up(): void
    {
        $services = [
            ['Door repair', 'Carpentry', 25, 'Doors that stick, drag, won’t close or won’t lock. Hinges, handles, locks and frames.'],
            ['Window repair', 'Carpentry', 45, 'Broken handles and locks, sliding windows that jam, damaged frames and rubber seals.'],
            ['Plumbing', 'Plumbing', 30, 'Leaking taps and pipes, blocked sinks and drains, toilets, water tanks and pumps.'],
            ['Mosquito screens', 'Fitting', 34, 'New screens for windows and doors, and repair of torn or loose screens.'],
            ['Broken glass', 'Glass', 30, 'Replace broken or cracked glass in windows, doors and cabinets.'],
            ['Wardrobes & cabinets', 'Carpentry', 60, 'Fix doors, hinges, drawers and shelves, or fit new wardrobes.'],
            ['Kitchen repair', 'Carpentry', 70, 'Kitchen cabinets, worktops, sinks and fittings, repaired or replaced.'],
            ['Cleaning', 'Cleaning', 20, 'Deep cleaning after repairs, before moving in, or between tenants.'],
            ['Renovation', 'Renovation', null, 'Bigger jobs: refresh a room, apartment or office. Quote on visit.'],
            ['Any other household repair', 'General repair', 30, 'Small jobs around the home or office.'],
            ['Property management', 'Property management', null, 'Managing rental properties, tenants and maintenance for owners.'],
        ];
        foreach ($services as [$name, $category, $price, $description]) {
            if (DB::table('service_catalog')->whereRaw('lower(name) = ?', [mb_strtolower($name)])->exists()) {
                continue;
            }
            DB::table('service_catalog')->insert([
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'unit' => $price === null ? null : 'starting price',
                'price' => $price,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Seeded rows may have been edited; leave them in place.
    }
};
