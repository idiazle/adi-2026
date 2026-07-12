<?php

use App\Http\Controllers\Admisiones\InscripcionDirectaController;
use App\Http\Controllers\Landing\PreinscripcionController;
use Illuminate\Support\Facades\Route;

// Landing Page
Route::inertia('/', 'landing/LandingPage')->name('home');

Route::get('/preinscripciones', [PreinscripcionController::class, 'create'])
    ->name('preinscripciones');

Route::post('/preinscripciones', [PreinscripcionController::class, 'store'])
    ->name('preinscripciones.store');

// Rutas de Intranet
Route::prefix('intranet')->name('intranet.')->group(function () {
    // Rutas públicas
    Route::inertia('login', 'intranet/auth/Login')->name('auth.login');
    
    // Rutas protegidas (descomenta el middleware cuando necesites auth)
    // Route::middleware(['auth'])->group(function () {
        Route::inertia('/', 'intranet/Dashboard')->name('dashboard');
        
        // Academia
        Route::inertia('/academia/alumnos', 'intranet/academia/Alumnos')->name('academia.alumnos');
        Route::inertia('/academia/cursos', 'intranet/academia/Cursos')->name('academia.cursos');
        Route::inertia('/academia/asistencia', 'intranet/academia/Asistencia')->name('academia.asistencia');
        Route::inertia('/academia/calificaciones', 'intranet/academia/Calificaciones')->name('academia.calificaciones');
        
        // Concurso CREM
        Route::inertia('/crem/categorias', 'intranet/crem/Categorias')->name('crem.categorias');
        Route::inertia('/crem/inscripciones', 'intranet/crem/Inscripciones')->name('crem.inscripciones');
        Route::inertia('/crem/jurados', 'intranet/crem/Jurados')->name('crem.jurados');
        Route::inertia('/crem/resultados', 'intranet/crem/Resultados')->name('crem.resultados');
        Route::inertia('/crem/configuracion', 'intranet/crem/Configuracion')->name('crem.configuracion');
        
        // Finanzas
        Route::inertia('/finanzas/pagos-cursos', 'intranet/finanzas/PagosCursos')->name('finanzas.pagos-cursos');
        Route::inertia('/finanzas/pagos-concurso', 'intranet/finanzas/PagosConcurso')->name('finanzas.pagos-concurso');
        
        // Profesores
        Route::inertia('/profesores/lista', 'intranet/profesores/Lista')->name('profesores.lista');
        Route::inertia('/profesores/asignaciones', 'intranet/profesores/Asignaciones')->name('profesores.asignaciones');
        
        // Admisiones
        Route::get('/admisiones/inscripciones', [InscripcionDirectaController::class, 'index'])
            ->name('admisiones.inscripciones');
        Route::post('/admisiones/inscripciones', [InscripcionDirectaController::class, 'store'])
            ->name('admisiones.inscripciones.store');
        Route::inertia('/admisiones/configuracion', 'intranet/admisiones/pages/Configuracion')->name('admisiones.configuracion');
        
        // Reportes
        Route::inertia('/reportes/general', 'intranet/reportes/General')->name('reportes.general');
        Route::inertia('/reportes/alumnos', 'intranet/reportes/Alumnos')->name('reportes.alumnos');
        Route::inertia('/reportes/finanzas', 'intranet/reportes/Finanzas')->name('reportes.finanzas');
        
        // Configuración
        Route::inertia('/settings', 'intranet/Settings')->name('settings');
    // });
});