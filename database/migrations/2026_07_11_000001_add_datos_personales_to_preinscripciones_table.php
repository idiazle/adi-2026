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
        Schema::table('preinscripciones', function (Blueprint $table) {
            // Datos personales separados
            $table->string('apellidos')->nullable();
            $table->string('nombres')->nullable();

            // Datos de identificación
            $table->enum('tipo_documento', ['DNI', 'CE', 'PAS', 'PTP'])->nullable();
            $table->string('numero_documento')->nullable();

            // Dirección
            $table->text('direccion')->nullable();

            $table->index('numero_documento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preinscripciones', function (Blueprint $table) {
            $table->dropIndex(['numero_documento']);
            $table->dropColumn([
                'apellidos',
                'nombres',
                'tipo_documento',
                'numero_documento',
                'direccion',
            ]);
        });
    }
};
