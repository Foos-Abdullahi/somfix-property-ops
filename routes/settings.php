<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile')->name('settings.index');
    Route::inertia('settings-general', 'settings/general')->name('settings.general');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(\App\Http\Controllers\Settings\AccessController::class)->group(function () {
        Route::middleware('can:users.manage')->group(function () {
            Route::get('settings/users', 'users')->name('settings.users.index');
            Route::post('settings/users', 'storeUser')->name('settings.users.store');
            Route::put('settings/users/{user}', 'updateUser')->name('settings.users.update');
            Route::delete('settings/users/{user}', 'destroyUser')->name('settings.users.destroy');
        });
        Route::middleware('can:roles.manage')->group(function () {
            Route::get('settings/roles', 'roles')->name('settings.roles.index');
            Route::post('settings/roles', 'storeRole')->name('settings.roles.store');
            Route::put('settings/roles/{role}', 'updateRole')->name('settings.roles.update');
            Route::delete('settings/roles/{role}', 'destroyRole')->name('settings.roles.destroy');
        });
        Route::get('settings/audit-log', 'audit')->middleware('can:audit-log.view')->name('settings.audit-log.index');
    });
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
