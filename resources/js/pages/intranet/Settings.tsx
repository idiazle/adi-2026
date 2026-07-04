import { Head } from '@inertiajs/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export default function Settings() {
    return (
        <>
            <Head title="Configuración" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-gray-500">Administra la configuración del sistema</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>Configuración básica del sistema</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="app-name">Nombre de la Aplicación</Label>
                                <Input id="app-name" defaultValue="AD Intranet" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="app-url">URL de la Aplicación</Label>
                                <Input id="app-url" defaultValue="http://localhost:8000" />
                            </div>
                            <Button>Guardar Cambios</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>Configura cómo recibir notificaciones</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Notificaciones por Email</p>
                                    <p className="text-sm text-gray-500">Recibe alertas por correo electrónico</p>
                                </div>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Notificaciones Push</p>
                                    <p className="text-sm text-gray-500">Recibe notificaciones en el navegador</p>
                                </div>
                                <input type="checkbox" className="w-5 h-5 rounded" />
                            </div>
                            <Button>Guardar Preferencias</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
