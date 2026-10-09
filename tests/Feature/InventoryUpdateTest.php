<?php

use App\Models\Inventory;
use App\Models\User;

it('updates inventory with its existing or a new unique SKU', function (bool $changeSku) {
    $inventory = Inventory::factory()->create();
    $sku = $changeSku ? 'UPDATED-SKU-001' : $inventory->sku;

    $this->actingAs(User::factory()->create())
        ->put(route('inventory.update', $inventory), [
            'name' => 'Updated inventory item',
            'sku' => $sku,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('inventory.show', $inventory));

    $this->assertDatabaseHas('inventories', [
        'id' => $inventory->id,
        'name' => 'Updated inventory item',
        'sku' => $sku,
    ]);
})->with([false, true]);

it('rejects a SKU belonging to another inventory item', function () {
    $inventory = Inventory::factory()->create();
    $other = Inventory::factory()->create();

    $this->actingAs(User::factory()->create())
        ->from(route('inventory.edit', $inventory))
        ->put(route('inventory.update', $inventory), ['sku' => $other->sku])
        ->assertSessionHasErrors('sku')
        ->assertRedirect(route('inventory.edit', $inventory));

    expect($inventory->fresh()->sku)->toBe($inventory->sku);
});
