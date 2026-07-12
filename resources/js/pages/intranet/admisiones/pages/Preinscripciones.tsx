import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, ClipboardCheck, Clock, Eye, UserPlus, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';

type Estado = 'pendiente' | 'aprobada' | 'rechazada' | 'inscrito';

type Preinscripcion = {
    id: number;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    fecha_nacimiento: string | null;
    sexo: 'M' | 'F' | null;
    nivel: string;
    grado: string;
    grupo: string | null;
    nombre_tutor: string;
    telefono_tutor: string;
    email_tutor: string | null;
    parentesco_tutor: string;
    periodo: string | null;
    estado: Estado;
    notas: string | null;
    revisado_por: string | null;
    revisado_at: string | null;
    created_at: string | null;
};

type SedeOption = { value: string; label: string };

type PageProps = {
    preinscripciones: Preinscripcion[];
    periodo_actual?: string;
    sedes: SedeOption[];
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

const ESTADO_CONFIG: Record<Estado, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success'; icon: React.ComponentType<{ className?: string }> }> = {
    pendiente: { label: 'Pendiente', variant: 'secondary', icon: Clock },
    aprobada: { label: 'Aprobada', variant: 'default', icon: CheckCircle },
    rechazada: { label: 'Rechazada', variant: 'destructive', icon: XCircle },
    inscrito: { label: 'Inscrito', variant: 'success', icon: UserPlus },
};

const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso ?? '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const NIVEL_LABEL: Record<string, string> = {
    primaria: 'Primaria',
    secundaria: 'Secundaria',
    preparatoria: 'Preparatoria',
};

export default function Preinscripciones() {
    const { props } = usePage<PageProps>();
    const { preinscripciones, periodo_actual, sedes, flash, errors } = props;

    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<Estado | 'todos'>('todos');
    const [detail, setDetail] = useState<Preinscripcion | null>(null);
    const [aprobarTarget, setAprobarTarget] = useState<Preinscripcion | null>(null);
    const [rechazarTarget, setRechazarTarget] = useState<Preinscripcion | null>(null);

    const [sede, setSede] = useState<string>('');
    const [grupo, setGrupo] = useState<string>('');
    const [notasAprobar, setNotasAprobar] = useState<string>('');
    const [notasRechazar, setNotasRechazar] = useState<string>('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const first = Object.values(errors)[0];
            if (first) toast.error(first);
        }
    }, [errors]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return preinscripciones.filter((p) => {
            if (estadoFilter !== 'todos' && p.estado !== estadoFilter) return false;
            if (!q) return true;
            return (
                p.nombre_completo.toLowerCase().includes(q) ||
                p.numero_documento.toLowerCase().includes(q) ||
                p.nombre_tutor.toLowerCase().includes(q)
            );
        });
    }, [preinscripciones, search, estadoFilter]);

    const stats = useMemo(() => {
        return {
            total: preinscripciones.length,
            pendientes: preinscripciones.filter((p) => p.estado === 'pendiente').length,
            aprobadas: preinscripciones.filter((p) => p.estado === 'aprobada').length,
            inscritas: preinscripciones.filter((p) => p.estado === 'inscrito').length,
            rechazadas: preinscripciones.filter((p) => p.estado === 'rechazada').length,
        };
    }, [preinscripciones]);

    const openAprobar = (p: Preinscripcion) => {
        setAprobarTarget(p);
        setSede('');
        setGrupo(p.grupo ?? '');
        setNotasAprobar('');
    };

    const openRechazar = (p: Preinscripcion) => {
        setRechazarTarget(p);
        setNotasRechazar('');
    };

    const submitAprobar = () => {
        if (!aprobarTarget || !sede) {
            toast.error('Selecciona una sede.');
            return;
        }
        router.post(
            `/intranet/admisiones/preinscripciones/${aprobarTarget.id}/aprobar`,
            { sede, grupo: grupo || null, notas: notasAprobar || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAprobarTarget(null);
                    toast.success('Preinscripción aprobada e inscrita.');
                },
            }
        );
    };

    const submitRechazar = () => {
        if (!rechazarTarget) return;
        router.post(
            `/intranet/admisiones/preinscripciones/${rechazarTarget.id}/rechazar`,
            { notas: notasRechazar || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRechazarTarget(null);
                    toast.success('Preinscripción rechazada.');
                },
            }
        );
    };

    return (
        <>
            <Head title="Preinscripciones" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Preinscripciones</h1>
                    <p className="text-gray-500">
                        Gestiona las preinscripciones del período activo
                        {periodo_actual ? (
                            <>
                                {' '}
                                — <span className="font-semibold">{periodo_actual}</span>
                            </>
                        ) : null}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <ClipboardCheck className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.aprobadas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Inscritas</CardTitle>
                            <UserPlus className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.inscritas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rechazadas}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar por nombre, documento o tutor…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-56">
                                <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v as Estado | 'todos')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los estados</SelectItem>
                                        <SelectItem value="pendiente">Pendientes</SelectItem>
                                        <SelectItem value="aprobada">Aprobadas</SelectItem>
                                        <SelectItem value="inscrito">Inscritas</SelectItem>
                                        <SelectItem value="rechazada">Rechazadas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Preinscripciones</CardTitle>
                        <CardDescription>
                            {filtered.length} de {preinscripciones.length} mostradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead>Postulante</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Nivel / Grado</TableHead>
                                    <TableHead>Tutor</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                            No hay preinscripciones que coincidan con los filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((p) => {
                                        const cfg = ESTADO_CONFIG[p.estado];
                                        const Icon = cfg.icon;
                                        const pendiente = p.estado === 'pendiente';
                                        return (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">
                                                    <div>{p.nombre_completo || `${p.nombres} ${p.apellidos}`}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {p.sexo === 'M' ? 'M' : p.sexo === 'F' ? 'F' : ''}
                                                        {p.fecha_nacimiento ? ` · ${formatDate(p.fecha_nacimiento)}` : ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{p.tipo_documento}</div>
                                                        <div className="text-gray-500">{p.numero_documento}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{NIVEL_LABEL[p.nivel] ?? p.nivel}</div>
                                                        <div className="text-gray-500">
                                                            {p.grado}
                                                            {p.grupo ? ` · ${p.grupo}` : ''}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{p.nombre_tutor}</div>
                                                        <div className="text-gray-500">
                                                            {p.parentesco_tutor} · {p.telefono_tutor}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {formatDate(p.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={cfg.variant}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {cfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setDetail(p)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Ver
                                                        </Button>
                                                        {pendiente && (
                                                            <>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() => openAprobar(p)}
                                                                >
                                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Aprobar
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => openRechazar(p)}
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Rechazar
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Ver detalle */}
            <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle de preinscripción</DialogTitle>
                        <DialogDescription>#{detail?.id} — {detail?.nombre_completo}</DialogDescription>
                    </DialogHeader>
                    {detail && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">Postulante</h4>
                                <p><span className="text-gray-500">Documento:</span> {detail.tipo_documento} {detail.numero_documento}</p>
                                <p><span className="text-gray-500">Sexo:</span> {detail.sexo ?? '—'}</p>
                                <p><span className="text-gray-500">Nacimiento:</span> {formatDate(detail.fecha_nacimiento)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Académico</h4>
                                <p><span className="text-gray-500">Nivel:</span> {NIVEL_LABEL[detail.nivel] ?? detail.nivel}</p>
                                <p><span className="text-gray-500">Grado:</span> {detail.grado}</p>
                                <p><span className="text-gray-500">Grupo:</span> {detail.grupo ?? '—'}</p>
                                <p><span className="text-gray-500">Período:</span> {detail.periodo ?? '—'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <h4 className="font-semibold mb-2">Tutor</h4>
                                <p><span className="text-gray-500">Nombre:</span> {detail.nombre_tutor} ({detail.parentesco_tutor})</p>
                                <p><span className="text-gray-500">Teléfono:</span> {detail.telefono_tutor}</p>
                                <p><span className="text-gray-500">Correo:</span> {detail.email_tutor ?? '—'}</p>
                            </div>
                            {detail.notas && (
                                <div className="sm:col-span-2">
                                    <h4 className="font-semibold mb-2">Notas</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{detail.notas}</p>
                                </div>
                            )}
                            {(detail.revisado_por || detail.revisado_at) && (
                                <div className="sm:col-span-2 text-xs text-gray-500 border-t pt-2">
                                    Revisado por {detail.revisado_por ?? '—'} el {formatDate(detail.revisado_at)}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal: Aprobar */}
            <Dialog open={!!aprobarTarget} onOpenChange={(open) => !open && setAprobarTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprobar e inscribir</DialogTitle>
                        <DialogDescription>
                            Se creará la persona, el usuario (rol estudiante) y la matrícula correspondiente a{' '}
                            <strong>{aprobarTarget?.nombre_completo}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sede">Sede <span className="text-red-500">*</span></Label>
                            <Select value={sede} onValueChange={setSede}>
                                <SelectTrigger id="sede">
                                    <SelectValue placeholder="Selecciona la sede..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sedes.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="grupo">Grupo</Label>
                            <Input
                                id="grupo"
                                value={grupo}
                                onChange={(e) => setGrupo(e.target.value.toUpperCase())}
                                placeholder="A, B, C…"
                                maxLength={5}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="notas_aprob">Notas (opcional)</Label>
                            <Input
                                id="notas_aprob"
                                value={notasAprobar}
                                onChange={(e) => setNotasAprobar(e.target.value)}
                                placeholder="Comentarios para el expediente"
                                maxLength={500}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setAprobarTarget(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={submitAprobar}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar aprobación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Rechazar */}
            <Dialog open={!!rechazarTarget} onOpenChange={(open) => !open && setRechazarTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar preinscripción</DialogTitle>
                        <DialogDescription>
                            Vas a rechazar la preinscripción de{' '}
                            <strong>{rechazarTarget?.nombre_completo}</strong>. Esta acción puede revertirse
                            aprobando luego la misma preinscripción.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="notas_rech">Motivo / notas (opcional)</Label>
                            <Input
                                id="notas_rech"
                                value={notasRechazar}
                                onChange={(e) => setNotasRechazar(e.target.value)}
                                placeholder="Documentos incompletos, edad fuera de rango, etc."
                                maxLength={500}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRechazarTarget(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitRechazar}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Confirmar rechazo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
