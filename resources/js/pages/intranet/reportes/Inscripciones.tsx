import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function ReporteInscripciones() {
    return (
        <>
            <Head title="Reporte de Inscripciones" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reporte de Inscripciones</h1>
                    <p className="text-gray-500">Reporte detallado de inscripciones</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Inscripciones por Período</CardTitle>
                        <CardDescription>Próximamente...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
