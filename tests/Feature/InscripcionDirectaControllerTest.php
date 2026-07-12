<?php

declare(strict_types=1);

use App\Models\Matricula;
use App\Models\Periodo;
use App\Models\Role;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

beforeEach(function () {
    // Sembrar los roles mínimos que asigna el controller.
    Role::firstOrCreate(['name' => Role::STUDENT]);
    Role::firstOrCreate(['name' => Role::ADMIN]);
});

it('asigna automáticamente el último periodo activo creado al inscribir', function () {
    // Tres periodos: uno inactivo, uno activo antiguo y el activo más reciente.
    $inactivo   = Periodo::factory()->inactivo()->create(['nombre' => 'Ciclo 2024-2']);
    $antiguo    = Periodo::factory()->create(['nombre' => 'Ciclo 2025-2']);
    $reciente   = Periodo::factory()->create(['nombre' => 'Ciclo 2026-1']);

    $admin = User::factory()->create();
    $admin->assignRole(Role::ADMIN);
    actingAs($admin);

    $payload = [
        'first_name'       => 'Juan',
        'last_name'        => 'Pérez',
        'document_type'    => 'DNI',
        'document_number'  => '12345678',
        'fecha_nacimiento' => '2010-05-12',
        'genero'           => 'M',
        'telefono'         => '987654321',
        'nivel'            => 'primaria',
        'grado'            => '3ro',
        'grupo'            => 'A',
        'sede'             => Matricula::SEDE_CENTRAL,
        // Importante: NO enviamos `periodo` en el payload.
        'tutor_first_name' => 'María',
        'tutor_last_name'  => 'García',
        'telefono_tutor'   => '999888777',
        'parentesco_tutor' => 'madre',
    ];

    $response = post(route('intranet.admisiones.inscripciones.store'), $payload);

    $response->assertRedirect(route('intranet.admisiones.inscripciones'));
    $response->assertSessionHas('success');

    $matricula = Matricula::firstOrFail();

    expect($matricula->periodo_id)->toBe($reciente->id)
        ->and($matricula->periodo->nombre)->toBe('Ciclo 2026-1');
});

it('rechaza la petición si no existe ningún periodo activo', function () {
    Periodo::factory()->inactivo()->create();

    $admin = User::factory()->create();
    $admin->assignRole(Role::ADMIN);
    actingAs($admin);

    $payload = [
        'first_name'       => 'Ana',
        'last_name'        => 'López',
        'document_type'    => 'DNI',
        'document_number'  => '87654321',
        'fecha_nacimiento' => '2011-03-04',
        'nivel'            => 'secundaria',
        'grado'            => '1ro',
        'sede'             => Matricula::SEDE_NORTE,
        'tutor_first_name' => 'Carlos',
        'tutor_last_name'  => 'Ramírez',
        'telefono_tutor'   => '988777666',
        'parentesco_tutor' => 'padre',
    ];

    // Sin periodos activos, el controller devuelve error de validación en
    // `errors.periodo` (no 404) y no crea Person/User/Matricula.
    post(route('intranet.admisiones.inscripciones.store'), $payload)
        ->assertRedirect()
        ->assertSessionHasErrors(['periodo' => 'No se puede crear la inscripción: no existe un período activo. Cree uno en Configuración antes de inscribir alumnos.']);

    $usersAntes = User::count(); // solo el admin creado en este test
    $personsAntes = \App\Models\Person::count();

    // Ningún Person/Matricula nuevo y ningún User adicional al admin.
    expect(Matricula::count())->toBe(0)
        ->and(\App\Models\Person::count())->toBe($personsAntes)
        ->and(User::count())->toBe($usersAntes)
        ->and($usersAntes)->toBe(1);
});