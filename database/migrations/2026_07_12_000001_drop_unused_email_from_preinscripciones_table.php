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
        Schema::table('preinscripciones', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropColumn('email');
        });
    }

    public function down(): void
    {
        Schema::table('preinscripciones', function (Blueprint $table) {
            $table->string('email')->nullable()->after('id');
            $table->index('email');
        });
    }
};