<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Refactor de la tabla users al nuevo esquema:
     *   id, person_id, username, password_hash, is_active, timestamps
     *
     * SQLite no permite DROP COLUMN de una columna que sea parte de un
     * índice sin antes eliminar el índice. Hacemos la refactorización
     * con SQL crudo para soportar SQLite limpiamente.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // 0) Eliminar FK de sessions.user_id si existe
        if (Schema::hasTable('sessions')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            // Quitar FKs declaradas en migraciones previas sobre users
            $table->dropForeign(['preinscripcion_id']);
            $table->dropForeign(['periodo_id']);
        });

        if ($driver === 'sqlite') {
            $this->refactorSqlite();
        } else {
            $this->refactorMysqlLike();
        }

        // 3) Re-aplicar la FK de sessions.user_id
        if (Schema::hasTable('sessions')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if (Schema::hasTable('sessions')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        if ($driver === 'sqlite') {
            $this->rollbackSqlite();
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['person_id']);
                $table->dropColumn(['person_id', 'username', 'password_hash', 'is_active']);

                $table->string('name')->after('id');
                $table->string('email')->unique()->after('name');
                $table->timestamp('email_verified_at')->nullable()->after('email');
                $table->string('password')->after('email_verified_at');
                $table->rememberToken();
            });
        }

        if (Schema::hasTable('sessions')) {
            Schema::table('sessions', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Refactor en SQLite: crear tabla nueva + swap atómico.
     */
    private function refactorSqlite(): void
    {
        // 1) Eliminar índices únicos que referencian columnas a eliminar
        DB::statement('DROP INDEX IF EXISTS "users_email_unique"');

        // 2) Crear tabla temporal con el esquema final
        DB::statement(<<<'SQL'
            CREATE TABLE "users_new" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "person_id" INTEGER NOT NULL,
                "username" TEXT NOT NULL,
                "password_hash" TEXT NOT NULL,
                "is_active" BOOLEAN NOT NULL DEFAULT 1,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL,
                FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE
            )
        SQL);

        // 3) Índices y restricciones
        DB::statement('CREATE UNIQUE INDEX "users_username_unique" ON "users_new" ("username")');
        DB::statement('CREATE INDEX "users_person_id_index" ON "users_new" ("person_id")');

        // 4) No conservamos filas: la tabla está vacía en este punto del refactor.
        //    Si en el futuro hay datos, copiar columna por columna aquí.

        // 5) Drop + rename
        DB::statement('DROP TABLE "users"');
        DB::statement('ALTER TABLE "users_new" RENAME TO "users"');
    }

    /**
     * Refactor en drivers tipo MySQL/Postgres que soportan DROP COLUMN.
     */
    private function refactorMysqlLike(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'name', 'email', 'email_verified_at', 'password', 'remember_token',
                'is_alumno', 'nivel', 'grado', 'grupo',
                'fecha_nacimiento', 'sexo', 'telefono',
                'nombre_tutor', 'telefono_tutor', 'parentesco_tutor',
                'preinscripcion_id', 'periodo_id',
                'estado_alumno', 'fecha_alta', 'fecha_baja',
            ]);

            $table->foreignId('person_id')->after('id')->constrained('persons')->cascadeOnDelete();
            $table->string('username')->after('person_id')->unique();
            $table->string('password_hash')->after('username');
            $table->boolean('is_active')->default(true)->after('password_hash');
        });
    }

    /**
     * Rollback en SQLite: revertir al esquema original con tabla nueva + swap.
     */
    private function rollbackSqlite(): void
    {
        DB::statement(<<<'SQL'
            CREATE TABLE "users_old" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "email_verified_at" TIMESTAMP NULL,
                "password" TEXT NOT NULL,
                "remember_token" TEXT NULL,
                "created_at" TIMESTAMP NULL,
                "updated_at" TIMESTAMP NULL
            )
        SQL);

        DB::statement('CREATE UNIQUE INDEX "users_email_unique" ON "users_old" ("email")');

        DB::statement('DROP TABLE "users"');
        DB::statement('ALTER TABLE "users_old" RENAME TO "users"');
    }
};
