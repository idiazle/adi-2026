import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Calendar, Save } from 'lucide-react';

export default function Configuracion() {
  return (
    <>
      <Head title="Configuración - Admisiones" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Admisiones</h1>
          <p className="text-gray-500">Configura los períodos y reglas de inscripción</p>
        </div>

        {/* Período Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período Activo
            </CardTitle>
            <CardDescription>
              Configura el ciclo escolar y fechas de preinscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Período</Label>
                <Input id="nombre" defaultValue="Ciclo 2026-2027" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <div className="flex items-center gap-2">
                  <Switch id="estado" defaultChecked />
                  <span className="text-sm text-gray-500">Activo</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inicio">Fecha de Inicio</Label>
                <Input id="inicio" type="date" defaultValue="2026-08-15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin">Fecha de Fin</Label>
                <Input id="fin" type="date" defaultValue="2027-07-15" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preinscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Preinscripciones</CardTitle>
            <CardDescription>
              Configura cuándo estará disponible el formulario de preinscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Permitir Preinscripciones</p>
                <p className="text-sm text-gray-500">Activa el formulario de preinscripción</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apertura">Fecha de Apertura</Label>
                <Input id="apertura" type="datetime-local" defaultValue="2026-06-01T09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cierre">Fecha de Cierre</Label>
                <Input id="cierre" type="datetime-local" defaultValue="2026-08-01T23:59" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Niveles */}
        <Card>
          <CardHeader>
            <CardTitle>Niveles y Grados</CardTitle>
            <CardDescription>
              Configura los niveles académicos disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Primaria</p>
                  <p className="text-sm text-gray-500">1ro a 6to grado</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Secundaria</p>
                  <p className="text-sm text-gray-500">1ro a 3er grado</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Preparatoria</p>
                  <p className="text-sm text-gray-500">1ro a 3er grado</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </>
  );
}
