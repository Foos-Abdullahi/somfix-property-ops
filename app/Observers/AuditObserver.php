<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class AuditObserver
{
    private const EXCLUDED = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes', 'created_at', 'updated_at'];

    public function created(Model $model): void
    {
        $this->record($model, 'created', [], $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        $this->record($model, 'updated', Arr::only($model->getRawOriginal(), array_keys($changes)), $changes);
    }

    public function deleted(Model $model): void
    {
        $this->record($model, 'deleted', $model->getAttributes(), []);
    }

    private function record(Model $model, string $action, array $before, array $after): void
    {
        $passwordChanged = array_key_exists('password', $after);
        $before = Arr::except($before, self::EXCLUDED);
        $after = Arr::except($after, self::EXCLUDED);
        if ($action === 'updated' && $before === [] && $after === [] && ! $passwordChanged) {
            return;
        }
        AuditLog::create([
            'actor_id' => $action === 'deleted' && $model instanceof User && $model->getKey() === auth()->id() ? null : auth()->id(),
            'actor_name' => auth()->user()?->name ?? 'System',
            'action' => $action,
            'subject_type' => class_basename($model),
            'subject_id' => $model->getKey(),
            'changes' => ['before' => $before, 'after' => $after, 'password_changed' => $passwordChanged],
        ]);
    }
}
