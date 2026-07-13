<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La columna `email` quedó como NOT NULL en la migración original pero el
 * modelo, el FormRequest y el formulario nunca la rellenan (el correo del
 * postulante menor de edad se guarda en `email_tutor`). Sin esta limpieza
 * SQLite lanza SQLSTATE[23000] al insertar preinscripciones.
 */
return new class extends Migration
{
    public function up(): void
    {
        // dropIndex por defecto apunta a <tabla>_<col>_index; si no existe, falla.
        // Lo hacemos idempotente con un wrapper que pruebe las dos formas.
        $this->safeDropIndex('preinscripciones', 'email');

        if (Schema::hasColumn('preinscripciones', 'email')) {
            Schema::table('preinscripciones', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('preinscripciones', 'email')) {
            Schema::table('preinscripciones', function (Blueprint $table) {
                $table->string('email')->nullable()->after('id');
            });
        }
    }

    /**
     * Intenta borrar un índice por nombre Laravel-style (`tabla_col_index`)
     * sin lanzar excepción si no existe. Compatible con SQLite/MySQL/Postgres.
     */
    private function safeDropIndex(string $table, string $column): void
    {
        $indexName = $table . '_' . $column . '_index';

        try {
            Schema::table($table, function (Blueprint $t) use ($indexName) {
                $t->dropIndex($indexName);
            });
        } catch (\Throwable $e) {
            // El índice no existe: nada que borrar.
        }
    }
};