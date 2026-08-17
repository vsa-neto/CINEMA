<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('seance_id')->constrained()->onDelete('cascade');
        $table->date('date');         // Дата сеанса (YYYY-MM-DD)
        $table->integer('row_index'); // Номер ряда (начиная с 0)
        $table->integer('seat_index');// Номер места в ряду (начиная с 0)
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('tickets');
}
};
