import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Asistencia() {
    return (
        <>
            <Head title="Asistencia" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
                    <p className="text-gray-500">Control de asistencia de alumnos</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Registro de Asistencia</CardTitle>
                        <CardDescription>Controla la asistencia diaria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
