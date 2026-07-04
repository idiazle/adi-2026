import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Asignaciones() {
    return (
        <>
            <Head title="Asignaciones" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
                    <p className="text-gray-500">Cursos asignados a cada profesor</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Asignaciones</CardTitle>
                        <CardDescription>Asignación de cursos a profesores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
