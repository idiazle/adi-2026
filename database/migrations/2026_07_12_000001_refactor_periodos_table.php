<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Refactor arquitectónico de la tabla `periodos`:
 *
 *  - Agrega `codigo` único (estable, referenciable en URLs/reportes).
 *  - Reemplaza el bool ambiguo `activo` por el enum `estado`
 *    (borrador / activo / cerrado), con índice para la query "vigente".
 *  - Reemplaza `preinscripciones_activas` (bool switch) por
 *    `preinscripciones_pausadas` (bool de pausa explícita) para que la
 *    ventana temporal sea la única fuente de verdad de apertura.
 *  - Agrega `softDeletes` para que un período con matrículas /
 *    preinscripciones nunca pueda eliminarse físicamente.
 *
 * La columna `nombre` se mantiene como etiqueta humana editable.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            // Codigo estable: ej "2026-1", "2026-VERANO".
            $table->string('codigo', 32)->nullable()->after('id');

            // Estado de ciclo de vida, reemplaza al bool `activo`.
            $table->string('estado', 16)->default('borrador')->after('codigo');

            // Pausa manual; la apertura real depende de la ventana temporal.
            $table->boolean('preinscripciones_pausadas')->default(false)
                ->after('preinscripciones_cierre');

            // Soft deletes.
            $table->softDeletes();
        });

        // Backfill de `codigo` a partir del nombre para que el índice único
        // pueda crearse sin colisiones en registros históricos.
        $rows = DB::table('periodos')->whereNull('codigo')->get();
        foreach ($rows as $row) {
            $codigo = $this->deriveCodigo($row->nombre);
            $suffix = 1;
            $base = $codigo;
            while (DB::table('periodos')->where('codigo', $codigo)->where('id', '!=', $row->id)->exists()) {
                $suffix++;
                $codigo = $base . '-' . $suffix;
            }
            DB::table('periodos')->where('id', $row->id)->update(['codigo' => $codigo]);
        }

        Schema::table('periodos', function (Blueprint $table) {
            $table->string('codigo', 32)->nullable(false)->change();
            $table->unique('codigo', 'periodos_codigo_unique');
            $table->index('estado', 'periodos_estado_index');
        });

        // Migrar datos: `activo = true` → `estado = activo`. Solo uno debería
        // estar activo; si hay varios, gana el de mayor id (consistente con
        // los controllers que usan `latest('id')->first()`).
        $vigenteId = DB::table('periodos')->where('activo', true)->orderByDesc('id')->value('id');
        DB::table('periodos')->update(['estado' => 'cerrado']);
        if ($vigenteId) {
            DB::table('periodos')->where('id', $vigenteId)->update(['estado' => 'activo']);
        }

        // Drop de columnas obsoletas. Usamos doctrine para poder borrar columnas
        // en SQLite (tests); en MySQL/Postgres también funciona.
        Schema::table('periodos', function (Blueprint $table) {
            $table->dropColumn(['activo', 'preinscripciones_activas']);
        });
    }

    public function down(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            $table->boolean('activo')->default(true);
            $table->boolean('preinscripciones_activas')->default(false);
        });

        DB::table('periodos')->where('estado', 'activo')->update(['activo' => true]);
        DB::table('periodos')->where('estado', '!=', 'activo')->update(['activo' => false]);

        Schema::table('periodos', function (Blueprint $table) {
            $table->dropUnique('periodos_codigo_unique');
            $table->dropIndex('periodos_estado_index');
            $table->dropColumn(['codigo', 'estado', 'preinscripciones_pausadas']);
            $table->dropSoftDeletes();
        });
    }

    /**
     * Convierte un nombre legible ("Ciclo 2026-1") en un codigo estable.
     */
    private function deriveCodigo(?string $nombre): string
    {
        if (! $nombre) {
            return 'PER-' . str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        }

        $slug = strtoupper(preg_replace('/[^A-Za-z0-9]+/', '-', $nombre) ?? '');
        return trim($slug, '-') ?: 'PER';
    }
};