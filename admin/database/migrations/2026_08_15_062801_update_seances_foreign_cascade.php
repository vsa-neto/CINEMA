<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seances', function (Blueprint $table) {
            // Дропаем старый внешний ключ и вешаем новый с каскадным удалением
            $table->dropForeign(['movie_id']);
            $table->foreignId('movie_id')->change()->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('seances', function (Blueprint $table) {
            $table->dropForeign(['movie_id']);
            $table->foreignId('movie_id')->change()->constrained();
        });
    }
};
