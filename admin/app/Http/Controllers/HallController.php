<?php

namespace App\Http\Controllers;

use App\Models\Hall;
use Illuminate\Http\Request;

class HallController extends Controller
{
    // Получение списка всех залов
    public function index()
    {
        return response()->json(Hall::all(), 200);
    }

    // Создание нового зала
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:halls,name',
        ], [
            'name.unique' => 'Зал с таким названием уже существует.',
        ]);
        $hall = Hall::create([
            'name' => $request->name
        ]);
        return response()->json($hall, 201);
    }

    public function updateConfig(Request $request, Hall $hall)
    {
        $request->validate([
            'rows_count' => 'required|integer|min:0',
            'seats_count' => 'required|integer|min:0',
            'layout' => 'required|array',
        ]);

        $hall->update([
            'rows_count' => $request->rows_count,
            'seats_count' => $request->seats_count,
            'layout' => $request->layout,
        ]);
        return response()->json($hall, 200);
    }


    public function updatePrices(Request $request, Hall $hall)
    {
        $request->validate([
            'price_standard' => 'required|integer|min:0',
            'price_vip' => 'required|integer|min:0',
        ]);

        $hall->update([
            'price_standard' => $request->price_standard,
            'price_vip' => $request->price_vip,
        ]);

        return response()->json($hall, 200);
    }
    
    // Смена значения актиности зала
    public function toggleStatus(Request $request, Hall $hall)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $hall->update([
            'is_active' => $request->is_active
        ]);

        return response()->json($hall, 200);
    }

    // Удаление зала
    public function destroy(Hall $hall)
    {
        $hall->delete();
        return response()->json(['message' => 'Зал успешно удален'], 200);
    }
}
