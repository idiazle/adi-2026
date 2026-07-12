<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla que materializa la "inscripción directa" de un alumno.
     * No modifica users ni persons: cuelga de persons vía person_id
     * y del período correspondiente.
     */
    public function up(): void
    {
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id();

            // Relaciones (no se tocan users ni persons)
            $table->foreignId('person_id')
                ->constrained('persons')
                ->cascadeOnDelete();
            $table->foreignId('periodo_id')
                ->constrained('periodos')
                ->restrictOnDelete();

            // Datos académicos. La sede como enum porque solo hay 2-3 valores.
            $table->enum('sede', ['central', 'norte', 'sur'])->default('central');
            $table->enum('nivel', ['primaria', 'secundaria', 'preparatoria']);
            $table->string('grado');                  // 1ro, 2do, 3ro, ...
            $table->string('grupo', 5)->nullable();   // A, B, C...

            // Estado de la matrícula
            $table->enum('estado', ['activa', 'baja', 'finalizada'])
                ->default('activa');

            // Datos del apoderado (viven aquí, no en persons)
            $table->string('nombre_tutor');
            $table->string('telefono_tutor', 30);
            $table->enum('parentesco_tutor', ['madre', 'padre', 'tutor', 'abuelo', 'hermano', 'otro']);

            $table->timestamps();

            // Una persona solo puede tener una matrícula por período
            $table->unique(['person_id', 'periodo_id'], 'matriculas_person_periodo_unique');
            $table->index(['periodo_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};
