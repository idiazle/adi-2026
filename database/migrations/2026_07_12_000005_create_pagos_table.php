<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla `pagos`: cada cobro individual contra una Inscripcion.
 *
 * Una Inscripcion puede tener varios Pagos (anticipo + saldo, o abonos
 * parciales). El estado `validado` es lo que suma al `monto_pagado` de la
 * Inscripcion y dispara la creación de la Matrícula cuando se completa.
 *
 * Estados:
 *  - `pendiente`:  subido por secretaria o por el alumno, aún no revisado.
 *  - `validado`:   admin/secretaria confirmó el comprobante; suma al monto_pagado.
 *  - `rechazado`:  comprobante inválido; requiere `motivo_rechazo`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inscripcion_id')
                ->constrained('inscripciones')
                ->cascadeOnDelete();

            $table->foreignId('concepto_pago_id')
                ->constrained('conceptos_pago')
                ->restrictOnDelete();

            $table->decimal('monto', 10, 2);

            $table->enum('metodo', ['efectivo', 'transferencia', 'yape', 'plin', 'otro'])
                ->default('efectivo');

            $table->string('referencia_externa', 100)->nullable();
            $table->string('comprobante_url')->nullable();

            $table->enum('estado', ['pendiente', 'validado', 'rechazado'])->default('pendiente');

            $table->date('fecha_pago')->nullable();           // fecha que dice el comprobante
            $table->timestamp('fecha_validacion')->nullable();

            $table->foreignId('validado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('motivo_rechazo')->nullable();
            $table->text('notas')->nullable();

            // Quién registró el pago (secretaria o el propio alumno desde el portal público).
            $table->foreignId('registrado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['inscripcion_id', 'estado']);
            $table->index(['estado', 'created_at']);  // cola de validación
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};