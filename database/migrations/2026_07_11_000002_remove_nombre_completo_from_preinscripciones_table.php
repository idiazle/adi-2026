<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Esta migración asume que la columna `nombre_completo` existía en
     * preinscripciones, pero la tabla original solo crea `id` + campos
     * académicos/tutor/estado. En SQLite/MySQL intentar `dropColumn` de
     * una columna inexistente lanza SQLSTATE y rompe TODA la suite.
     *
     * La convertimos en idempotente: solo borra si la columna existe.
     */
    public function up(): void
    {
        if (Schema::hasColumn('preinscripciones', 'nombre_completo')) {
            Schema::table('preinscripciones', function (Blueprint $table) {
                $table->dropColumn('nombre_completo');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('preinscripciones', 'nombre_completo')) {
            Schema::table('preinscripciones', function (Blueprint $table) {
                $table->string('nombre_completo')->nullable()->after('id');
            });
        }
    }
};
