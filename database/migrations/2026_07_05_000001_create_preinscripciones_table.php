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
        Schema::create('preinscripciones', function (Blueprint $table) {
            $table->id();
            
            // Datos personales
            $table->string('nombre_completo');
            $table->string('email');
            $table->string('telefono')->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('sexo', ['M', 'F'])->nullable();
            
            // Datos académicos
            $table->string('nivel')->comment('ej: Primaria, Secundaria, Preparatoria');
            $table->string('grado')->comment('ej: 1ro, 2do, 3ro');
            $table->string('grupo')->nullable();
            
            // Datos del tutor (si es menor)
            $table->string('nombre_tutor')->nullable();
            $table->string('telefono_tutor')->nullable();
            $table->string('parentesco_tutor')->nullable();
            
            // Control del período de preinscripción
            $table->foreignId('periodo_id')->constrained('periodos')->onDelete('cascade');
            
            // Estado de la preinscripción
            $table->enum('estado', [
                'pendiente', 
                'aprobada', 
                'rechazada',
                'inscrito'
            ])->default('pendiente');
            
            // Notas administrativas
            $table->text('notas')->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('revisado_at')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['periodo_id', 'estado']);
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preinscripciones');
    }
};
