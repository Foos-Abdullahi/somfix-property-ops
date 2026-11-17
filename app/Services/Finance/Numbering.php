<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\DB;

class Numbering
{
    /** Next sequential reference such as EXP-202611-0007 (sequence restarts each month). */
    public static function next(string $prefix, string $table, string $column): string
    {
        $stem = $prefix.'-'.now()->format('Ym').'-';
        $last = DB::table($table)->where($column, 'like', $stem.'%')->orderByDesc($column)->value($column);
        $sequence = $last ? ((int) substr((string) $last, strlen($stem))) + 1 : 1;

        return $stem.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
