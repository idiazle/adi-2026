<?php

/*
 * Tests del flujo de registro HTTP.
 *
 * Estarán deshabilitados hasta que las vistas / rutas del frontend
 * estén implementadas. La acción CreateNewUser ya está cubierta en
 * tests/Feature/Backend/CreateNewUserActionTest.php.
 */

beforeEach(function () {
    $this->markTestSkipped(
        'Pendiente del frontend: requiere vista auth/register. '.
        'Lógica de backend cubierta en Backend/CreateNewUserActionTest.php'
    );
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
