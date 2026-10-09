<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\User;
use App\Observers\AuditObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
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
            ('App\\Models\\'.$model)::observe(AuditObserver::class);
        }
        foreach (array_filter(array_keys(config('permissions')), 'is_string') as $permission) {
            Gate::define($permission, fn (User $user) => $user->hasPermission($permission));
        }
        foreach ([Login::class => 'login', Logout::class => 'logout'] as $event => $action) {
            Event::listen($event, function ($event) use ($action) {
                if ($event->user) {
                    AuditLog::create(['actor_id' => $event->user->id, 'actor_name' => $event->user->name, 'action' => $action, 'subject_type' => 'User', 'subject_id' => $event->user->id]);
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
