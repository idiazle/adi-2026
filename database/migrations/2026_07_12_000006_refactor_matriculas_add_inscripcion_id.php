<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Refactor de `matriculas`:
 *
 *  - Agrega `inscripcion_id` (FK a inscripciones) como fuente de verdad del
 *    vínculo entre la matrícula y su pago. Mantenemos `person_id` y `periodo_id`
 *    para no romper queries existentes y porque siguen siendo referencias útiles.
 *  - Una inscripción solo puede tener una matrícula (1:1) → UNIQUE.
 *  - El índice único anterior `matriculas_person_periodo_unique` se conserva;
 *    el nuevo `inscripcion_id` también es único, así no se duplican matrículas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->foreignId('inscripcion_id')
                ->nullable()
                ->after('periodo_id')
                ->constrained('inscripciones')
                ->nullOnDelete();

            // 1:1 entre inscripcion y matricula
            $table->unique('inscripcion_id', 'matriculas_inscripcion_unique');
        });
    }

    public function down(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropUnique('matriculas_inscripcion_unique');
            $table->dropForeign(['inscripcion_id']);
            $table->dropColumn('inscripcion_id');
        });
    }
};