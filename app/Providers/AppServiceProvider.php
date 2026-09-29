<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        foreach (['User', 'Role', 'Property', 'Unit', 'Tenant', 'Lease', 'Maintenance', 'WorkOrder', 'ServiceTeam', 'Inventory', 'Finance'] as $model) {
            ('App\\Models\\'.$model)::observe(\App\Observers\AuditObserver::class);
        }
        foreach (array_keys(config('permissions')) as $permission) {
            \Illuminate\Support\Facades\Gate::define($permission, fn (\App\Models\User $user) => $user->hasPermission($permission));
        }
        foreach ([\Illuminate\Auth\Events\Login::class => 'login', \Illuminate\Auth\Events\Logout::class => 'logout'] as $event => $action) {
            \Illuminate\Support\Facades\Event::listen($event, function ($event) use ($action) {
                if ($event->user) {
                    \App\Models\AuditLog::create(['actor_id' => $event->user->id, 'actor_name' => $event->user->name, 'action' => $action, 'subject_type' => 'User', 'subject_id' => $event->user->id]);
                }
            });
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
