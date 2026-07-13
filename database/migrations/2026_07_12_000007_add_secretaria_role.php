<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Agrega el rol `secretaria` al catálogo.
 *
 * Permisos esperados (definidos a nivel de middleware/policies):
 *  - Crear Inscripciones (admisión directa).
 *  - Registrar Pagos (a nombre de un alumno o de sí misma como caja).
 *  - Consultar listado de Inscripciones.
 *
 * NO puede:
 *  - Validar ni rechazar pagos (esa tarea queda para `admin`).
 *  - Aprobar/rechazar Preinscripciones (queda para `admin`).
 *  - Editar Periodos (queda para `admin`).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('roles')->where('name', 'secretaria')->exists()) {
            DB::table('roles')->insert([
                'name'       => 'secretaria',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('roles')->where('name', 'secretaria')->delete();
    }
};