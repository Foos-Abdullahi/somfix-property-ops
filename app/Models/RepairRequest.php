<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'phone', 'area', 'service', 'message', 'photo_path'])]
#[Hidden(['photo_path'])]
class RepairRequest extends Model
{
    //
}
