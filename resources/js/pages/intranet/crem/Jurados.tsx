import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Jurados() {
    return (
        <>
            <Head title="Jurados - CREM" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Jurados</h1>
                    <p className="text-gray-500">Gestiona los jurados del concurso</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Panel de Jurados</CardTitle>
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
