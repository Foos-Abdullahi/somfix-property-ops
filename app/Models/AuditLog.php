<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected $appends = ['record_name'];

    public function getRecordNameAttribute(): string
    {
        $changes = $this->getAttribute('changes') ?? [];
        foreach ([$changes['record_name'] ?? null, $changes['after']['name'] ?? null, $changes['after']['title'] ?? null, $changes['before']['name'] ?? null, $changes['before']['title'] ?? null] as $name) {
            if (is_string($name) && $name !== '') {
                return $name;
            }
        }
        if ($this->subject_type === 'User') {
            if (in_array($this->action, ['login', 'logout']) && $this->actor_name) {
                return $this->actor_name;
            }
            $name = User::find($this->subject_id)?->name;
            if ($name) {
                return $name;
            }
        }

        return $this->subject_type.($this->subject_id ? ' #'.$this->subject_id : '');
    }

    protected function casts(): array
    {
        return ['changes' => 'array', 'created_at' => 'datetime'];
    }
}
