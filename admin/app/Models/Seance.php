<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    protected $fillable = ['hall_id', 'movie_id', 'start_time'];
    protected $with = ['movie', 'hall']; // Автоматически подгружать данные фильма

    // Отношение к модели фильма
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    // Отношение к модели зала (Именно этого не хватало!)
    public function hall()
    {
        return $this->belongsTo(Hall::class);
    }
}
