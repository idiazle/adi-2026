<?php

/*
 * Tests del flujo de autenticación HTTP (login, logout, rate-limit).
 *
 * Estarán deshabilitados hasta que las vistas / rutas del frontend
 * estén implementadas (login screen + redirección a dashboard).
 * La lógica de backend ya está cubierta en tests/Feature/Backend/.
 */

beforeEach(function () {
    $this->markTestSkipped(
        'Pendiente del frontend: requiere vistas auth/login y ruta `dashboard`. '.
        'Lógica de backend cubierta en Backend/UserSchemaTest.php'
    );
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
