import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Inscripciones() {
    return (
        <>
            <Head title="Inscripciones - CREM" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inscripciones al Concurso</h1>
                    <p className="text-gray-500">Gestiona las inscripciones al concurso CREM</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Inscripciones</CardTitle>
                        <CardDescription>Lista de participantes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
