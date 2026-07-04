import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function PagosCursos() {
    return (
        <>
            <Head title="Pagos Cursos" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pagos de Cursos</h1>
                    <p className="text-gray-500">Gestiona los pagos de inscripciones</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos de Cursos</CardTitle>
                        <CardDescription>Historial de pagos de la academia</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
