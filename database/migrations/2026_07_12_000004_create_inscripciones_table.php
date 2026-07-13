<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `inscripciones`: intermediario entre la solicitud (preinscripción
 * o admisión directa) y la matrícula definitiva. Aquí se cobra el pago.
 *
 *  - `preinscripcion_id` es NULLABLE: admisión directa no parte de una
 *    preinscripción.
 *  - `person_id` es NULLABLE: en admisión directa la persona se crea dentro
 *    de la misma transacción que la inscripción, por lo que el orden importa.
 *    Lo creamos primero como Person (id local) y luego la Inscripcion.
 *  - `monto_inscripcion` es snapshot del precio al momento de crear la
 *    inscripción; no se actualiza si luego cambia la tarifa del período.
 *  - `monto_pagado` se recalcula vía observer cada vez que un Pago cambia
 *    su estado a `validado` o `rechazado`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();

            // Origen: una preinscripción aprobada o una admisión directa
            $table->foreignId('preinscripcion_id')
                ->nullable()
                ->constrained('preinscripciones')
                ->nullOnDelete();

            // Persona interesada (puede ser NULL temporalmente si el orden
            // de creación lo requiere; ver InscripcionDirectaController).
            $table->foreignId('person_id')
                ->nullable()
                ->constrained('persons')
                ->nullOnDelete();

            $table->foreignId('periodo_id')
                ->constrained('periodos')
                ->restrictOnDelete();

            // Snapshot académico (puede ajustarse antes de pagar)
            $table->enum('nivel', ['primaria', 'secundaria', 'preparatoria']);
            $table->string('grado', 10);
            $table->string('grupo', 5)->nullable();
            $table->enum('sede_propuesta', ['central', 'norte', 'sur'])->default('central');

            // Snapshot monetario: lo que el alumno debe pagar al momento de crear la inscripción.
            $table->decimal('monto_inscripcion', 10, 2);

            // Denormalizado: suma de pagos en estado `validado`. Se actualiza
            // con observer. No es fuente de verdad para auditoría (eso es `pagos`).
            $table->decimal('monto_pagado', 10, 2)->default(0);

            $table->enum('estado', ['pendiente', 'pagada', 'anulada'])->default('pendiente');

            // Auditoría
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('notas')->nullable();

            $table->timestamps();

            // Una persona solo puede tener una inscripción activa por período.
            // Nota: si se permitieran re-inscripciones históricas, esto debería
            // considerar el estado (solo contar pendientes/pagadas).
            $table->unique(['person_id', 'periodo_id'], 'inscripciones_person_periodo_unique');

            $table->index(['periodo_id', 'estado']);
            $table->index('preinscripcion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};