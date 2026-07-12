import { Head, usePage } from '@inertiajs/react';
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
import { useEffect } from 'react';
import { toast } from 'sonner';
import { NuevaInscripcionModal } from '../components/organism/NuevaInscripcionModal';

interface Inscripcion {
  id: number;
  nombre: string;
  telefono: string | null;
  nivel: string;
  grado: string;
  grupo: string | null;
  sede: string;
  periodo: string;
  fecha_inscripcion: string;
}

interface PageProps extends Record<string, unknown> {
  inscripciones: Inscripcion[];
  periodo_actual?: string;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function InscripcionesDirectas() {
  const { props } = usePage<PageProps>();
  const inscripciones = props.inscripciones ?? [];
  const periodoActual = props.periodo_actual;
  const flash = props.flash;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  return (
    <>
      <Head title="Inscripciones Directas" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inscripciones Directas</h1>
            <p className="text-gray-500">Registro inmediato de alumnos</p>
          </div>
          <NuevaInscripcionModal periodoActual={periodoActual} />
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o documento..."
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
                  Sede
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alumnos Inscritos</CardTitle>
            <CardDescription>
              Total: {inscripciones.length} alumnos en el sistema
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
                  <TableHead>Sede</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha Inscripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscripciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No hay inscripciones registradas todavía.
                    </TableCell>
                  </TableRow>
                ) : (
                  inscripciones.map((inscripcion) => (
                    <TableRow key={inscripcion.id}>
                      <TableCell className="font-medium">{inscripcion.nombre}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {inscripcion.telefono ?? '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inscripcion.nivel} - {inscripcion.grado}
                      </TableCell>
                      <TableCell>{inscripcion.grupo ?? '—'}</TableCell>
                      <TableCell className="capitalize">{inscripcion.sede}</TableCell>
                      <TableCell>{inscripcion.periodo}</TableCell>
                      <TableCell>{inscripcion.fecha_inscripcion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Ver</Button>
                          <Button variant="outline" size="sm">Editar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
