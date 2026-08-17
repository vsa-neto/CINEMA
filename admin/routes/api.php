<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\HallController;

use App\Http\Controllers\MovieController;
use App\Http\Controllers\SeanceController;
use App\Http\Controllers\TicketController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::put('/halls/{hall}/config', [HallController::class, 'updateConfig']);
    Route::put('/halls/{hall}/prices', [HallController::class, 'updatePrices']);

    Route::apiResource('movies', MovieController::class);
    Route::apiResource('seances', SeanceController::class);

    // Маршруты для управления залами
    Route::apiResource('halls', HallController::class)->only(['index', 'store', 'destroy']);

    // Маршруты для смены активности зала
    Route::put('/halls/{hall}/toggle-status', [HallController::class, 'toggleStatus']);
});

// Публичный маршрут для главной страницы посетителей (без авторизации)
Route::get('/client/showtimes', function() {
    // Получаем только активные залы со всей их конфигурацией
    $activeHalls = \App\Models\Hall::where('is_active', true)->get();
    
    // Получаем текущие сеансы
    $seances = \App\Models\Seance::with('movie')->get();
    
    return response()->json([
        'halls' => $activeHalls,
        'seances' => $seances
    ], 200);
});

Route::get('/client/seances/{seance}/details', [SeanceController::class, 'getClientDetails']);

Route::post('/client/booking', [TicketController::class, 'bookTickets']);


