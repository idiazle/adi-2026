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
        Schema::table('users', function (Blueprint $table) {
            // Indicador de que es alumno
            $table->boolean('is_alumno')->default(false);
            
            // Datos académicos (validados de preinscripción)
            $table->string('nivel')->nullable();
            $table->string('grado')->nullable();
            $table->string('grupo')->nullable();
            
            // Datos personales adicionales
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('sexo', ['M', 'F'])->nullable();
            $table->string('telefono')->nullable();
            
            // Tutor
            $table->string('nombre_tutor')->nullable();
            $table->string('telefono_tutor')->nullable();
            $table->string('parentesco_tutor')->nullable();
            
            // Vinculación a preinscripción (si viene de ahí)
            $table->foreignId('preinscripcion_id')->nullable()->constrained('preinscripciones')->onDelete('set null');
            
            // Período de inscripción
            $table->foreignId('periodo_id')->nullable()->constrained('periodos')->onDelete('set null');
            
            // Estado del alumno
            $table->enum('estado_alumno', ['activo', 'inactivo', 'egresado', 'expulsado'])->default('activo');
            
            // Fechas
            $table->date('fecha_alta')->nullable();
            $table->date('fecha_baja')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['preinscripcion_id']);
            $table->dropForeign(['periodo_id']);
            $table->dropColumn([
                'is_alumno',
                'nivel',
                'grado', 
                'grupo',
                'fecha_nacimiento',
                'sexo',
                'telefono',
                'nombre_tutor',
                'telefono_tutor',
                'parentesco_tutor',
                'preinscripcion_id',
                'periodo_id',
                'estado_alumno',
                'fecha_alta',
                'fecha_baja',
            ]);
        });
    }
};
