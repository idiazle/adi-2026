<?php
use Illuminate\Support\Facades\Route;
// Landing Page
Route::inertia('/', 'landing/LandingPage')->name('home');
// Rutas de Intranet
Route::prefix('intranet')->name('intranet.')->group(function () {
    Route::inertia('login', 'intranet/auth/Login')->name('auth.login');
});
