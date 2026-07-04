import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function PagosConcurso() {
    return (
        <>
            <Head title="Pagos Concurso" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pagos del Concurso</h1>
                    <p className="text-gray-500">Gestiona los pagos de inscripción al CREM</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos del Concurso</CardTitle>
                        <CardDescription>Historial de pagos del concurso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
