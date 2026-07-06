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
        Schema::create('periodos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->comment('ej: Ciclo 2026-2027');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('preinscripciones_activas')->default(false);
            $table->datetime('preinscripciones_apertura')->nullable();
            $table->datetime('preinscripciones_cierre')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periodos');
    }
};
