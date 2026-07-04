import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function ReportePagos() {
    return (
        <>
            <Head title="Reporte de Pagos" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reporte de Pagos</h1>
                    <p className="text-gray-500">Reporte detallado de pagos</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos por Período</CardTitle>
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
