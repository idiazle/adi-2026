import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function ListaProfesores() {
    return (
        <>
            <Head title="Profesores" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profesores</h1>
                    <p className="text-gray-500">Lista del cuerpo docente</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Profesores</CardTitle>
                        <CardDescription>Listado de profesores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
