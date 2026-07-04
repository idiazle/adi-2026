import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Resultados() {
    return (
        <>
            <Head title="Resultados - CREM" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>
                    <p className="text-gray-500">Publica y gestiona los resultados del concurso</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados del Concurso</CardTitle>
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
