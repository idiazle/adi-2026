import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Calendar, History, Pencil, Plus, Save } from 'lucide-react';

// Ziggy no está instalado en este proyecto, por lo que `route()` no está
// disponible en el frontend. Usamos las URL literales definidas en
// routes/web.php para crear/actualizar períodos.
const CONFIGURACION_URL = '/intranet/admisiones/configuracion';
const NUEVO_PERIODO_URL = '/intranet/admisiones/configuracion/nuevo';
const EDIT_PERIODO_URL = (id: number) =>
  `/intranet/admisiones/configuracion/${id}/editar`;

type Periodo = {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  preinscripciones_activas: boolean;
  preinscripciones_apertura: string | null;
  preinscripciones_cierre: string | null;
} | null;

type HistorialItem = {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  preinscripciones_activas: boolean;
};

type PageProps = {
  periodo: Periodo;
  historial: HistorialItem[];
  flash?: { success?: string; error?: string };
};

export default function Configuracion() {
  const { periodo, historial = [], flash } = usePage<PageProps>().props;
  const esEdicion = Boolean(periodo?.id);

  const { data, setData, put, post, processing, errors, reset } = useForm({
    nombre: periodo?.nombre ?? '',
    fecha_inicio: periodo?.fecha_inicio ?? '',
    fecha_fin: periodo?.fecha_fin ?? '',
    activo: periodo?.activo ?? true,
    preinscripciones_activas: periodo?.preinscripciones_activas ?? false,
    preinscripciones_apertura: periodo?.preinscripciones_apertura ?? '',
    preinscripciones_cierre: periodo?.preinscripciones_cierre ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (esEdicion && periodo) {
      // PUT a la ruta de actualización. Inertia convierte este método
      // a POST con _method=PUT por debajo.
      put(`/intranet/admisiones/configuracion/${periodo.id}`, {
        preserveScroll: true,
      });
    } else {
      post(CONFIGURACION_URL, {
        preserveScroll: true,
        onSuccess: () => reset(),
      });
    }
  };

  const editarPeriodo = (id: number) => {
    router.visit(EDIT_PERIODO_URL(id), { preserveScroll: true });
  };

  const nuevoPeriodo = () => {
    // Limpiamos el estado local por si quedara algo del período anterior
    // y luego navegamos a la ruta dedicada `create`, que el backend
    // resuelve enviando `periodo = null` siempre (formulario vacío).
    reset();
    router.visit(NUEVO_PERIODO_URL, { preserveScroll: true });
  };

  return (
    <>
      <Head title="Configuración - Admisiones" />
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Admisiones</h1>
            <p className="text-gray-500">Crea y administra los períodos del ciclo escolar</p>
          </div>
          {esEdicion && (
            <Button variant="outline" onClick={nuevoPeriodo}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo período
            </Button>
          )}
        </div>

        {flash?.success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            {flash.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {esEdicion ? `Editando: ${periodo?.nombre}` : 'Nuevo período'}
            </h2>
            {esEdicion && (
              <span className="text-xs text-gray-500">ID: {periodo?.id}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datos del Período
                </CardTitle>
                <CardDescription>
                  Define el ciclo escolar. Solo puede haber un período activo a la vez.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Período</Label>
                    <Input
                      id="nombre"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      placeholder="Ciclo 2026-2027"
                    />
                    {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activo">Estado</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch
                        id="activo"
                        checked={data.activo}
                        onCheckedChange={(checked) => setData('activo', checked)}
                      />
                      <span className="text-sm text-gray-500">{data.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={data.fecha_inicio}
                      onChange={(e) => setData('fecha_inicio', e.target.value)}
                    />
                    {errors.fecha_inicio && <p className="text-sm text-red-600">{errors.fecha_inicio}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={data.fecha_fin}
                      onChange={(e) => setData('fecha_fin', e.target.value)}
                    />
                    {errors.fecha_fin && <p className="text-sm text-red-600">{errors.fecha_fin}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preinscripciones</CardTitle>
                <CardDescription>
                  Ventana de tiempo en la que el formulario público estará disponible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3 bg-white shadow-sm">
                  <div>
                    <p className="font-medium">Permitir Preinscripciones</p>
                    <p className="text-sm text-gray-500">Habilita el formulario público</p>
                  </div>
                  <Switch
                    checked={data.preinscripciones_activas}
                    onCheckedChange={(checked) => setData('preinscripciones_activas', checked)}
                  />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!data.preinscripciones_activas ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <Label htmlFor="preinscripciones_apertura">Fecha de Apertura</Label>
                    <Input
                      id="preinscripciones_apertura"
                      type="datetime-local"
                      value={data.preinscripciones_apertura}
                      onChange={(e) => setData('preinscripciones_apertura', e.target.value)}
                    />
                    {errors.preinscripciones_apertura && (
                      <p className="text-sm text-red-600">{errors.preinscripciones_apertura}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preinscripciones_cierre">Fecha de Cierre</Label>
                    <Input
                      id="preinscripciones_cierre"
                      type="datetime-local"
                      value={data.preinscripciones_cierre}
                      onChange={(e) => setData('preinscripciones_cierre', e.target.value)}
                    />
                    {errors.preinscripciones_cierre && (
                      <p className="text-sm text-red-600">{errors.preinscripciones_cierre}</p>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing
                ? 'Guardando...'
                : esEdicion
                  ? 'Actualizar Período'
                  : 'Guardar Período'}
            </Button>
          </div>
        </form>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Períodos
            </CardTitle>
            <CardDescription>
              Pulsa <strong>Editar</strong> sobre una fila para modificar sus datos y preinscripciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay períodos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4">Inicio</th>
                      <th className="py-2 pr-4">Fin</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2 pr-4">Preinscripción</th>
                      <th className="py-2 pr-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b last:border-0 ${periodo?.id === p.id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-2 pr-4 font-medium">{p.nombre}</td>
                        <td className="py-2 pr-4">{p.fecha_inicio}</td>
                        <td className="py-2 pr-4">{p.fecha_fin}</td>
                        <td className="py-2 pr-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${p.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {p.preinscripciones_activas ? 'Habilitada' : 'Cerrada'}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editarPeriodo(p.id)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
