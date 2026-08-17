<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MovieController extends Controller
{
    public function index()
    {
        return response()->json(Movie::latest()->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'description' => 'required|string',
            'country' => 'required|string',
            'poster_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $posterUrl = asset('src/assets/img/poster.png');

        if ($request->hasFile('poster_file')) {
            // $path = $request->file('poster_file')->store('posters', 'public');
            // $posterUrl = asset('storage/' . $path);
            $file = $request->file('poster_file');
        
        // Оригинальное имя загружаемого файла 
        $originalName = $file->getClientOriginalName();
        
        // storeAs() вместо store(). 
        // Если файл с именем "avatar.jpg" уже лежит в папке, он автоматически перезапишется!
        $path = $file->storeAs('posters', $originalName, 'public');
        
        // Абсолютный URL для фронтенда
        $posterUrl = asset('storage/' . $path);
        }

        $colors = ['rgba(220, 220, 106, 1)', 'rgba(220, 220, 106, 1)', 'rgba(128, 102, 156, 1)', 'rgba(255, 255, 255, 1)', 'rgba(122, 199, 209, 1)', 'rgba(123, 196, 248, 1)'];
        $randomColor = $colors[array_rand($colors)];

        // запись в базе данных MySQL
        $movie = Movie::create([
            'title' => $request->title,
            'duration' => $request->duration,
            'description' => $request->description,
            'country' => $request->country,
            'poster' => $posterUrl,
            'color' => $randomColor,
        ]);

        return response()->json($movie, 201);
    }

    public function destroy(Movie $movie)
    {
        // Удаляем запись из БД (сеансы в MySQL удалятся автоматически)
        $movie->delete();
        return response()->json(['message' => 'Фильм успешно удален'], 200);
    }
}
