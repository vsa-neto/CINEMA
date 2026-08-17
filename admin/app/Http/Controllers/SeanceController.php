<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use App\Models\Movie;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SeanceController extends Controller
{
    public function index()
    {
        return response()->json(Seance::orderBy('start_time')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hall_id' => 'required|exists:halls,id',
            'movie_id' => 'required|exists:movies,id',
            'start_time' => 'required|date_format:H:i',
        ]);

        $movie = Movie::findOrFail($request->movie_id);
        $newStart = Carbon::createFromFormat('H:i', $request->start_time);
        $newEnd = (clone $newStart)->addMinutes($movie->duration);

        $existingSeances = Seance::where('hall_id', $request->hall_id)->get();

        foreach ($existingSeances as $seance) {
            $currStart = Carbon::createFromFormat('H:i:s', $seance->start_time);
            $currEnd = (clone $currStart)->addMinutes($seance->movie->duration);

            if ($newStart->lt($currEnd) && $newEnd->gt($currStart)) {
                return response()->json([
                    'errors' => [
                        'start_time' => ["Время пересекается с фильмом '{$seance->movie->title}' ({$seance->start_time} - " . $currEnd->format('H:i') . ")"]
                    ]
                ], 422);
            }
        }

        $seance = Seance::create($request->all());
        return response()->json($seance, 201);
    }

    public function getClientDetails(Request $request, $id)
{
    $request->validate([
        'date' => 'required|date_format:Y-m-d'
    ]);

    // Получаем сеанс с фильмом и залом
    $seance = Seance::with(['movie', 'hall'])->findOrFail($id);

    // Получаем список занятых билетов на этот сеанс и эту дату
    $takenSeats = \App\Models\Ticket::where('seance_id', $id)
        ->where('date', $request->date)
        ->get(['row_index', 'seat_index']);

    return response()->json([
        'seance' => $seance,
        'taken_seats' => $takenSeats
    ], 200);
}

    public function destroy(Seance $seance)
    {
        $seance->delete();
        return response()->json(['message' => 'Сеанс успешно удален'], 200);
    }
}
