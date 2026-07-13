<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Agrega las columnas de tarifa al período:
 *  - `monto_inscripcion`: monto único que paga el alumno para matricularse.
 *  - `monto_mensualidad`: cuota mensual que se repite por la duración del ciclo.
 *
 * Ambas son snapshots: cuando se crea una Inscripcion se copia `monto_inscripcion`
 * del período en ese momento, así cambios tarifarios futuros no afectan
 * inscripciones ya existentes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            $table->decimal('monto_inscripcion', 10, 2)->default(0)->after('preinscripciones_pausadas');
            $table->decimal('monto_mensualidad', 10, 2)->default(0)->after('monto_inscripcion');
        });
    }

    public function down(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            $table->dropColumn(['monto_inscripcion', 'monto_mensualidad']);
        });
    }
};