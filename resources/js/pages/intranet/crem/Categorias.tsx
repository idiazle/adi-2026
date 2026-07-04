import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Categorias() {
    return (
        <>
            <Head title="Categorías - CREM" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
                    <p className="text-gray-500">Gestiona las categorías del concurso CREM</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Categorías del Concurso</CardTitle>
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
