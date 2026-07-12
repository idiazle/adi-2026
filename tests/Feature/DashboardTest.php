<?php

/*
 * Tests del dashboard / ruta principal autenticada.
 *
 * Estarán deshabilitados hasta que las rutas del dashboard estén
 * implementadas (frontend pendiente).
 */

beforeEach(function () {
    $this->markTestSkipped('Pendiente del frontend: requiere ruta `dashboard` y vista');
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
