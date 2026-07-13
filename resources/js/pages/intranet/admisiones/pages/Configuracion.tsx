import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Calendar, CheckCircle2, Clock, Eye, History, Lock, PauseCircle, Pencil, Plus, Save, XCircle } from 'lucide-react';

// Ziggy no está instalado en este proyecto, por lo que `route()` no está
// disponible en el frontend. Usamos las URL literales definidas en
// routes/web.php para crear/actualizar períodos.
const CONFIGURACION_URL = '/intranet/admisiones/configuracion';
const NUEVO_PERIODO_URL = '/intranet/admisiones/configuracion/nuevo';
const EDIT_PERIODO_URL = (id: number) =>
  `/intranet/admisiones/configuracion/${id}/editar`;

type Periodo = {
  id: number;
  codigo?: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'borrador' | 'activo' | 'cerrado';
  estado_label?: string;
  preinscripciones_pausadas: boolean;
  preinscripciones_apertura: string | null;
  preinscripciones_cierre: string | null;
  // Campos legacy opcionales para no romper payloads viejos
  // mientras conviven con la migración.
  activo?: boolean;
  preinscripciones_activas?: boolean;
} | null;

type HistorialItem = {
  id: number;
  codigo?: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'borrador' | 'activo' | 'cerrado';
  estado_label?: string;
  preinscripciones_pausadas: boolean;
  // legacy
  activo?: boolean;
  preinscripciones_activas?: boolean;
};

const badgeEstado = (estado?: string, legacyActivo?: boolean) => {
  if (estado === 'activo' || (estado === undefined && legacyActivo === true)) {
    return { label: 'Activo', cls: 'bg-green-100 text-green-800' };
  }
  if (estado === 'cerrado') {
    return { label: 'Cerrado', cls: 'bg-gray-200 text-gray-700' };
  }
  return { label: 'Borrador', cls: 'bg-yellow-100 text-yellow-800' };
};

// Replica en frontend de Periodo::arePreinscripcionesAbiertas().
// Devuelve el estado público actual del formulario de preinscripciones.
type EstadoPreinscripciones =
  | 'sin_periodo_activo'
  | 'sin_ventana'
  | 'pausada'
  | 'proxima'
  | 'abierta'
  | 'cerrada_por_ventana';

type BannerInfo = {
  estado: EstadoPreinscripciones;
  label: string;
  descripcion: string;
  cls: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const calcEstadoPreinscripciones = (
  periodoEstado: string | undefined,
  pausada: boolean,
  apertura: string | null,
  cierre: string | null,
): BannerInfo => {
  // 0. Período cerrado -> solo lectura.
  if (periodoEstado === 'cerrado') {
    return {
      estado: 'cerrada_por_ventana',
      label: 'Período cerrado',
      descripcion:
        'Este período está cerrado y no admite modificaciones. Puedes consultarlo pero no editarlo.',
      cls: 'bg-gray-100 border-gray-300 text-gray-700',
      Icon: Lock,
    };
  }

  // 1. Sin período activo -> nunca se muestra formulario público.
  if (periodoEstado !== 'activo') {
    return {
      estado: 'sin_periodo_activo',
      label: 'Sin período activo',
      descripcion:
        'Solo el período marcado como Activo expone el formulario público. Cambia el estado a Activo para habilitarlo.',
      cls: 'bg-gray-50 border-gray-200 text-gray-700',
      Icon: XCircle,
    };
  }

  // 2. Pausa manual -> tiene prioridad sobre la ventana.
  if (pausada) {
    return {
      estado: 'pausada',
      label: 'Preinscripciones pausadas',
      descripcion:
        'Has pausado el formulario manualmente. El público no podrá inscribirse aunque la ventana esté vigente.',
      cls: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      Icon: PauseCircle,
    };
  }

  // 3. Sin ventana configurada -> cerrado por seguridad.
  if (!apertura && !cierre) {
    return {
      estado: 'sin_ventana',
      label: 'Sin ventana configurada',
      descripcion:
        'Define una fecha de apertura y/o de cierre para que el formulario público esté disponible.',
      cls: 'bg-gray-50 border-gray-200 text-gray-700',
      Icon: Clock,
    };
  }

  const now = new Date();
  const aperturaDate = apertura ? new Date(apertura) : null;
  const cierreDate = cierre ? new Date(cierre) : null;

  // 4. Aún no llega la apertura.
  if (aperturaDate && now < aperturaDate) {
    return {
      estado: 'proxima',
      label: 'Abrirá pronto',
      descripcion: `La apertura está programada para ${aperturaDate.toLocaleString()}.`,
      cls: 'bg-blue-50 border-blue-200 text-blue-800',
      Icon: Clock,
    };
  }

  // 5. Ya pasó el cierre.
  if (cierreDate && now > cierreDate) {
    return {
      estado: 'cerrada_por_ventana',
      label: 'Ventana cerrada',
      descripcion: `La ventana cerró el ${cierreDate.toLocaleString()}. Amplía la fecha de cierre para reabrir.`,
      cls: 'bg-red-50 border-red-200 text-red-800',
      Icon: XCircle,
    };
  }

  // 6. Dentro de la ventana -> abiertas.
  return {
    estado: 'abierta',
    label: 'Preinscripciones abiertas',
    descripcion:
      cierreDate
        ? `El formulario público está disponible hasta el ${cierreDate.toLocaleString()}.`
        : 'El formulario público está disponible.',
    cls: 'bg-green-50 border-green-200 text-green-800',
    Icon: CheckCircle2,
  };
};

type PageProps = {
  periodo: Periodo;
  historial: HistorialItem[];
  flash?: { success?: string; error?: string };
};

export default function Configuracion() {
  const { periodo, historial = [], flash } = usePage<PageProps>().props;
  const esEdicion = Boolean(periodo?.id);
  // Cuando el período está cerrado, el formulario pasa a modo "solo lectura":
  // no se pueden modificar datos ni el estado. El usuario solo puede
  // consultar la información desde el historial.
  const esSoloLectura = esEdicion && periodo?.estado === 'cerrado';

  const { data, setData, put, post, processing, errors, reset } = useForm({
    codigo: periodo?.codigo ?? '',
    nombre: periodo?.nombre ?? '',
    fecha_inicio: periodo?.fecha_inicio ?? '',
    fecha_fin: periodo?.fecha_fin ?? '',
    estado: (periodo?.estado ?? (periodo?.activo ? 'activo' : 'borrador')) as
      | 'borrador'
      | 'activo'
      | 'cerrado',
    preinscripciones_pausadas:
      periodo?.preinscripciones_pausadas ?? periodo?.preinscripciones_activas ?? false,
    preinscripciones_apertura: periodo?.preinscripciones_apertura ?? '',
    preinscripciones_cierre: periodo?.preinscripciones_cierre ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Doble red de seguridad: si el período está cerrado no enviamos
    // nada aunque alguien manipule el `disabled` del botón.
    if (esSoloLectura) {
      return;
    }

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
          {esEdicion && !esSoloLectura && (
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
              {esSoloLectura
                ? `Viendo: ${periodo?.nombre}`
                : esEdicion
                  ? `Editando: ${periodo?.nombre}`
                  : 'Nuevo período'}
            </h2>
            <div className="flex items-center gap-2">
              {esSoloLectura && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  <Lock className="h-3 w-3" />
                  Solo lectura
                </span>
              )}
              {esEdicion && (
                <span className="text-xs text-gray-500">ID: {periodo?.id}</span>
              )}
            </div>
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
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={data.codigo}
                      onChange={(e) => setData('codigo', e.target.value)}
                      placeholder="2026-1"
                      disabled={esSoloLectura}
                    />
                    {errors.codigo && <p className="text-sm text-red-600">{errors.codigo}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Período</Label>
                    <Input
                      id="nombre"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      placeholder="Ciclo 2026-2027"
                      disabled={esSoloLectura}
                    />
                    {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <select
                      id="estado"
                      value={data.estado}
                      onChange={(e) => setData('estado', e.target.value as Periodo extends null ? never : NonNullable<Periodo>['estado'])}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      disabled={esSoloLectura}
                    >
                      <option value="borrador">Borrador</option>
                      <option value="activo">Activo</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                    {errors.estado && <p className="text-sm text-red-600">{errors.estado}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={data.fecha_inicio}
                      onChange={(e) => setData('fecha_inicio', e.target.value)}
                      disabled={esSoloLectura}
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
                      disabled={esSoloLectura}
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
                    <p className="font-medium">Pausar preinscripciones</p>
                    <p className="text-sm text-gray-500">
                      Si está pausado, el formulario público se cierra aunque la ventana siga vigente.
                    </p>
                  </div>
                  <Switch
                    checked={data.preinscripciones_pausadas}
                    onCheckedChange={(checked) => setData('preinscripciones_pausadas', checked)}
                    disabled={esSoloLectura}
                  />
                </div>

                {(() => {
                  const banner = calcEstadoPreinscripciones(
                    data.estado,
                    data.preinscripciones_pausadas,
                    data.preinscripciones_apertura || null,
                    data.preinscripciones_cierre || null,
                  );
                  const { Icon } = banner;
                  return (
                    <div className={`flex items-start gap-3 rounded-md border p-3 ${banner.cls}`}>
                      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold">{banner.label}</p>
                        <p className="opacity-90">{banner.descripcion}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!data.preinscripciones_apertura && !data.preinscripciones_cierre ? '' : ''}`}>
                  <div className="space-y-2">
                    <Label htmlFor="preinscripciones_apertura">Fecha de Apertura</Label>
                    <Input
                      id="preinscripciones_apertura"
                      type="datetime-local"
                      value={data.preinscripciones_apertura}
                      onChange={(e) => setData('preinscripciones_apertura', e.target.value)}
                      disabled={esSoloLectura}
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
                      disabled={esSoloLectura}
                    />
                    {errors.preinscripciones_cierre && (
                      <p className="text-sm text-red-600">{errors.preinscripciones_cierre}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  La apertura real la define la ventana temporal. Si ambas fechas están vacías,
                  el formulario público se considera cerrado.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={processing || esSoloLectura}>
              <Save className="h-4 w-4 mr-2" />
              {processing
                ? 'Guardando...'
                : esSoloLectura
                  ? 'Solo lectura'
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
              Los períodos <strong>cerrados</strong> solo se pueden consultar.
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
                        <td className="py-2 pr-4">
                          <div className="font-medium">{p.nombre}</div>
                          {p.codigo && (
                            <div className="text-xs text-gray-500 font-mono">{p.codigo}</div>
                          )}
                        </td>
                        <td className="py-2 pr-4">{p.fecha_inicio}</td>
                        <td className="py-2 pr-4">{p.fecha_fin}</td>
                        <td className="py-2 pr-4">
                          {(() => {
                            const b = badgeEstado(p.estado, p.activo);
                            return (
                              <span className={`rounded-full px-2 py-0.5 text-xs ${b.cls}`}>
                                {b.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-2 pr-4">
                          {(p.preinscripciones_pausadas ?? p.preinscripciones_activas ?? false)
                            ? 'Pausada'
                            : 'Habilitada'}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editarPeriodo(p.id)}
                          >
                            {p.estado === 'cerrado' ? (
                              <>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Ver
                              </>
                            ) : (
                              <>
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </>
                            )}
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
