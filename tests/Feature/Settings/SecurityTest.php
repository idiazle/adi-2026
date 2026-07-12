<?php

/*
 * Tests de la pantalla /settings/security.
 *
 * Estarán deshabilitados hasta que la vista security esté implementada.
 */

beforeEach(function () {
    $this->markTestSkipped('Pendiente del frontend: requiere vista settings/security');
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
