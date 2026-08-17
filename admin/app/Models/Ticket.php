<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = ['seance_id', 'date', 'row_index', 'seat_index'];
}
