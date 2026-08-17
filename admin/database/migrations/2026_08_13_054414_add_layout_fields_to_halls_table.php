<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('halls', function (Blueprint $table) {
            $table->integer('rows_count')->default(0);
            $table->integer('seats_count')->default(0);
            $table->json('layout')->nullable(); // Сетка кресел [['standart', 'vip'], ...]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('halls', function (Blueprint $table) {
        $table->dropColumn(['rows_count', 'seats_count', 'layout']);
        });
    }
};
