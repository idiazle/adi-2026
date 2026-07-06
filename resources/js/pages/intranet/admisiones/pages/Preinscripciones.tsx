import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';

// Datos de ejemplo
const preinscripcionesData = [
  {
    id: 1,
    nombre: 'María García López',
    email: 'maria.garcia@email.com',
    telefono: '5512345678',
    nivel: 'Secundaria',
    grado: '1ro',
    periodo: 'Ciclo 2026-2027',
    estado: 'pendiente',
    fecha: '2026-07-01'
  },
  {
    id: 2,
    nombre: 'Juan Pérez Hernández',
    email: 'juan.perez@email.com',
    telefono: '5587654321',
    nivel: 'Preparatoria',
    grado: '1ro',
    periodo: 'Ciclo 2026-2027',
    estado: 'aprobada',
    fecha: '2026-06-28'
  },
  {
    id: 3,
    nombre: 'Ana Martínez Ruiz',
    email: 'ana.martinez@email.com',
    telefono: '5534567890',
    nivel: 'Primaria',
    grado: '3ro',
    periodo: 'Ciclo 2026-2027',
    estado: 'pendiente',
    fecha: '2026-07-03'
  },
];

const estadoConfig = {
  pendiente: {
    label: 'Pendiente',
    variant: 'secondary' as const,
    icon: Clock
  },
  aprobada: {
    label: 'Aprobada',
    variant: 'default' as const,
    icon: CheckCircle
  },
  rechazada: {
    label: 'Rechazada',
    variant: 'destructive' as const,
    icon: XCircle
  },
  inscrito: {
    label: 'Inscrito',
    variant: 'success' as const,
    icon: UserPlus
  },
};

export default function Preinscripciones() {
  const pendientesCount = preinscripcionesData.filter(p => p.estado === 'pendiente').length;

  return (
    <>
      <Head title="Preinscripciones" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preinscripciones</h1>
          <p className="text-gray-500">Gestiona las preinscripciones del período activo</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preinscripcionesData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendientesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {preinscripcionesData.filter(p => p.estado === 'aprobada').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inscritas</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {preinscripcionesData.filter(p => p.estado === 'inscrito').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Preinscripciones</CardTitle>
            <CardDescription>
              Período: <span className="font-semibold">Ciclo 2026-2027</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preinscripcionesData.map((preinscripcion) => {
                  const config = estadoConfig[preinscripcion.estado as keyof typeof estadoConfig];
                  const Icon = config.icon;
                  return (
                    <TableRow key={preinscripcion.id}>
                      <TableCell className="font-medium">
                        {preinscripcion.nombre}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{preinscripcion.email}</div>
                          <div className="text-gray-500">{preinscripcion.telefono}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {preinscripcion.nivel} - {preinscripcion.grado}
                      </TableCell>
                      <TableCell>{preinscripcion.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                          {preinscripcion.estado === 'pendiente' && (
                            <>
                              <Button variant="default" size="sm">
                                Aprobar
                              </Button>
                              <Button variant="destructive" size="sm">
                                Rechazar
                              </Button>
                            </>
                          )}
                          {preinscripcion.estado === 'aprobada' && (
                            <Button variant="default" size="sm">
                              Inscribir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
