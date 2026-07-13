<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de conceptos de pago: inscripción, mensualidad, materiales, etc.
 *
 * Mantener un catálogo (en vez de un enum en `pagos`) permite agregar
 * conceptos sin migraciones futuras (p. ej. "uniforme", "evento").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conceptos_pago', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 32)->unique(); // 'inscripcion', 'mensualidad', ...
            $table->string('nombre', 120);
            $table->string('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        DB::table('conceptos_pago')->insert([
            [
                'codigo'      => 'inscripcion',
                'nombre'      => 'Inscripción',
                'descripcion' => 'Pago único por inscripción al período académico.',
                'activo'      => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'codigo'      => 'mensualidad',
                'nombre'      => 'Mensualidad',
                'descripcion' => 'Cuota mensual de la matrícula activa.',
                'activo'      => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('conceptos_pago');
    }
};