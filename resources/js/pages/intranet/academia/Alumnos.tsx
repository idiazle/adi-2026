import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Alumnos() {
    return (
        <>
            <Head title="Alumnos" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
                    <p className="text-gray-500">Gestiona los alumnos de la academia</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Alumnos</CardTitle>
                        <CardDescription>Gestiona el registro de estudiantes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
