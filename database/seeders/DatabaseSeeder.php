<?php

namespace Database\Seeders;

use App\Enums\EstadoPeriodo;
use App\Models\Periodo;
use App\Models\Person;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1) Roles base del sistema (idempotente)
        foreach ([Role::STUDENT, Role::TEACHER, Role::PARENT, Role::TUTOR, Role::ADMIN] as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // 1.1) Períodos base para inscripciones (idempotente por codigo)
        Periodo::firstOrCreate(
            ['codigo' => '2026-1'],
            [
                'nombre'       => 'Ciclo 2026-1',
                'fecha_inicio' => '2026-02-01',
                'fecha_fin'    => '2026-07-15',
                'estado'       => EstadoPeriodo::Activo,
            ],
        );
        Periodo::firstOrCreate(
            ['codigo' => '2026-2'],
            [
                'nombre'       => 'Ciclo 2026-2',
                'fecha_inicio' => '2026-08-01',
                'fecha_fin'    => '2026-12-15',
                'estado'       => EstadoPeriodo::Cerrado,
            ],
        );

        // 2) Persona y usuario administrador de prueba
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'person_id'     => Person::factory()->create([
                    'first_name' => 'Admin',
                    'last_name'  => 'Sistema',
                ])->id,
                'password_hash' => 'password',
                'is_active'     => true,
            ],
        );
        $admin->assignRole(Role::ADMIN);
    }
}
