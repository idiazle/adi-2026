import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import {
  Search,
  Download,
  Filter
} from 'lucide-react';
import { NuevaInscripcionModal } from '../components/organism/NuevaInscripcionModal';

// Datos de ejemplo
const inscripcionesData = [
  {
    id: 1,
    nombre: 'Carlos Jiménez Soto',
    email: 'carlos.jimenez@email.com',
    telefono: '5512345678',
    nivel: 'Secundaria',
    grado: '2do',
    grupo: 'A',
    periodo: 'Ciclo 2026-2027',
    fecha_inscripcion: '2026-07-05'
  },
  {
    id: 2,
    nombre: 'Laura Flores Díaz',
    email: 'laura.flores@email.com',
    telefono: '5587654321',
    nivel: 'Preparatoria',
    grado: '1ro',
    grupo: 'B',
    periodo: 'Ciclo 2026-2027',
    fecha_inscripcion: '2026-07-04'
  },
];

export default function InscripcionesDirectas() {
  return (
    <>
      <Head title="Inscripciones Directas" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inscripciones Directas</h1>
            <p className="text-gray-500">Registro inmediato de alumnos</p>
          </div>
          <NuevaInscripcionModal />
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Nivel
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Grado
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Alumnos Inscritos</CardTitle>
            <CardDescription>
              Total: {inscripcionesData.length} alumnos en el período actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Fecha Inscripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscripcionesData.map((inscripcion) => (
                  <TableRow key={inscripcion.id}>
                    <TableCell className="font-medium">
                      {inscripcion.nombre}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{inscripcion.email}</div>
                        <div className="text-gray-500">{inscripcion.telefono}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inscripcion.nivel} - {inscripcion.grado}
                    </TableCell>
                    <TableCell>{inscripcion.grupo}</TableCell>
                    <TableCell>{inscripcion.fecha_inscripcion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
