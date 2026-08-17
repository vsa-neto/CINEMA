<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
   /**
     * [POST] /api/client/booking
     * Публичный метод бронирования мест посетителем
     */
    public function bookTickets(Request $request)
    {
        $request->validate([
            'seance_id' => 'required|exists:seances,id',
            'date' => 'required|date_format:Y-m-d',
            'seats' => 'required|array|min:1',
            'seats.*.row' => 'required|integer|min:0',
            'seats.*.seat' => 'required|integer|min:0',
        ]);

        $seanceId = $request->seance_id;
        $date = $request->date;
        $seats = $request->seats;

        // Используем базу данных в режиме транзакции, чтобы исключить двойное бронирование
        return DB::transaction(function () use ($seanceId, $date, $seats) {
            $bookedTickets = [];

            foreach ($seats as $seat) {
                // Дополнительная проверка: не занято ли место прямо сейчас, пока пользователь думал
                $exists = Ticket::where('seance_id', $seanceId)
                    ->where('date', $date)
                    ->where('row_index', $seat['row'])
                    ->where('seat_index', $seat['seat'])
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'message' => "Одно или несколько выбранных мест уже забронированы. Пожалуйста, вернитесь на схему зала."
                    ], 422);
                }

                // Создаем билет в MySQL
                $ticket = Ticket::create([
                    'seance_id' => $seanceId,
                    'date' => $date,
                    'row_index' => $seat['row'],
                    'seat_index' => $seat['seat'],
                ]);

                $bookedTickets[] = $ticket;
            }

            return response()->json([
                'message' => 'Бронирование успешно завершено!',
                'tickets' => $bookedTickets
            ], 201);
        });
    }
}
