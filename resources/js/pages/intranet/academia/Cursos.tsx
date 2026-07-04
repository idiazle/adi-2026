import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function Cursos() {
    return (
        <>
            <Head title="Cursos" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
                    <p className="text-gray-500">Gestiona los cursos y niveles</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Cursos de la Academia</CardTitle>
                        <CardDescription>Configura los niveles y programas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Contenido en desarrollo</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
