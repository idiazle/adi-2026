import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Calificaciones() {
    return (
        <>
            <Head title="Calificaciones" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calificaciones</h1>
                    <p className="text-gray-500">Gestiona las calificaciones de alumnos</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Calificaciones por Curso</CardTitle>
                        <CardDescription>Registro de evaluaciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
