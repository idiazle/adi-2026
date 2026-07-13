<?php

use App\Http\Controllers\Academia\AlumnoController;
use App\Http\Controllers\Admisiones\ConfiguracionController;
use App\Http\Controllers\Admisiones\InscripcionController;
use App\Http\Controllers\Admisiones\InscripcionDirectaController;
use App\Http\Controllers\Admisiones\PagoController;
use App\Http\Controllers\Admisiones\PreinscripcionController;
use Illuminate\Support\Facades\Route;

// Landing Page
Route::inertia('/', 'landing/LandingPage')->name('home');

Route::get('/preinscripciones', [PreinscripcionController::class, 'create'])
    ->name('preinscripciones');

Route::post('/preinscripciones', [PreinscripcionController::class, 'store'])
    ->name('preinscripciones.store');

// Rutas de Intranet
Route::prefix('intranet')->name('intranet.')->group(function () {
    // Rutas públicas (login)
    Route::middleware('guest')->group(function () {
        Route::inertia('login', 'intranet/auth/Login')->name('auth.login');

        // Procesa el formulario de inicio de sesión (username + password).
        Route::post('login', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'store'])
            ->name('auth.login.store');
    });

    // Cerrar sesión (requiere estar autenticado).
    Route::middleware('auth')->post('logout', [\Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::class, 'destroy'])
        ->name('auth.logout');

    // Rutas protegidas: cualquier usuario autenticado puede entrar al panel.
    Route::middleware(['auth'])->group(function () {
        Route::inertia('/', 'intranet/Dashboard')->name('dashboard');

        // Academia
        Route::get('/academia/alumnos', [AlumnoController::class, 'index'])->name('academia.alumnos');
        Route::inertia('/academia/cursos', 'intranet/academia/Cursos')->name('academia.cursos');
        Route::inertia('/academia/asistencia', 'intranet/academia/Asistencia')->name('academia.asistencia');
        Route::inertia('/academia/calificaciones', 'intranet/academia/Calificaciones')->name('academia.calificaciones');

        // Concurso CREM
        Route::inertia('/crem/categorias', 'intranet/crem/Categorias')->name('crem.categorias');
        Route::inertia('/crem/inscripciones', 'intranet/crem/Inscripciones')->name('crem.inscripciones');
        Route::inertia('/crem/jurados', 'intranet/crem/Jurados')->name('crem.jurados');
        Route::inertia('/crem/resultados', 'intranet/crem/Resultados')->name('crem.resultados');
        Route::inertia('/crem/configuracion', 'intranet/crem/Configuracion')->name('crem.configuracion');

        // Finanzas - Cola de pagos (solo admin valida)
        Route::middleware('role:admin')->prefix('finanzas')->name('finanzas.')->group(function () {
            Route::get('/pagos', [PagoController::class, 'index'])
                ->name('pagos-cursos');
            Route::post('/pagos/{pago}/decidir', [PagoController::class, 'decidir'])
                ->whereNumber('pago')
                ->name('pagos.decidir');
        });

        // Profesores
        Route::inertia('/profesores/lista', 'intranet/profesores/Lista')->name('profesores.lista');
        Route::inertia('/profesores/asignaciones', 'intranet/profesores/Asignaciones')->name('profesores.asignaciones');

        // Admisiones - Preinscripciones (admin revisa y aprueba)
        Route::middleware('role:admin')->group(function () {
            Route::get('/admisiones/preinscripciones', [PreinscripcionController::class, 'index'])
                ->name('admisiones.preinscripciones');
            Route::post('/admisiones/preinscripciones/{preinscripcion}/aprobar', [PreinscripcionController::class, 'aprobar'])
                ->whereNumber('preinscripcion')
                ->name('admisiones.preinscripciones.aprobar');
            Route::post('/admisiones/preinscripciones/{preinscripcion}/rechazar', [PreinscripcionController::class, 'rechazar'])
                ->whereNumber('preinscripcion')
                ->name('admisiones.preinscripciones.rechazar');
        });

        // Admisiones - Inscripciones (admin y secretaria operan caja)
        Route::middleware('role:admin,secretaria')->group(function () {
            Route::get('/admisiones/inscripciones', [InscripcionDirectaController::class, 'index'])
                ->name('admisiones.inscripciones');
            Route::post('/admisiones/inscripciones', [InscripcionDirectaController::class, 'store'])
                ->name('admisiones.inscripciones.store');

            Route::get('/admisiones/inscripciones/{inscripcion}', [InscripcionController::class, 'show'])
                ->whereNumber('inscripcion')
                ->name('admisiones.inscripciones.show');

            Route::post('/admisiones/inscripciones/{inscripcion}/pagos', [PagoController::class, 'store'])
                ->whereNumber('inscripcion')
                ->name('admisiones.inscripciones.pagos.store');
        });

        Route::get('/admisiones/configuracion', [ConfiguracionController::class, 'index'])
            ->name('admisiones.configuracion');
        Route::get('/admisiones/configuracion/nuevo', [ConfiguracionController::class, 'create'])
            ->name('admisiones.configuracion.create');
        Route::get('/admisiones/configuracion/{periodo}/editar', [ConfiguracionController::class, 'edit'])
            ->whereNumber('periodo')
            ->name('admisiones.configuracion.edit');
        Route::post('/admisiones/configuracion', [ConfiguracionController::class, 'store'])
            ->name('admisiones.configuracion.store');
        Route::put('/admisiones/configuracion/{periodo}', [ConfiguracionController::class, 'update'])
            ->name('admisiones.configuracion.update');

        // Reportes
        Route::inertia('/reportes/general', 'intranet/reportes/General')->name('reportes.general');
        Route::inertia('/reportes/alumnos', 'intranet/reportes/Alumnos')->name('reportes.alumnos');
        Route::inertia('/reportes/finanzas', 'intranet/reportes/Finanzas')->name('reportes.finanzas');

        // Configuración
        Route::inertia('/settings', 'intranet/Settings')->name('settings');
    });
});