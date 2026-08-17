<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    protected $fillable = ['name', 'rows_count', 'seats_count', 'layout', 'price_standard', 'price_vip', 'is_active'];
    protected $casts = ['layout' => 'array', ];
}
