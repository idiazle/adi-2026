import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function ReporteFinanzas() {
    return (
        <>
            <Head title="Reporte Finanzas" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reporte Financiero</h1>
                    <p className="text-gray-500">Resumen de ingresos</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Ingresos</CardTitle>
                        <CardDescription>Resumen financiero</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
