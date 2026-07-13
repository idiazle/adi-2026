import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, CheckCircle2, Clock, Download, Eye, Filter, Search, UserPlus, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

import { NuevaInscripcionModal } from '../components/organism/NuevaInscripcionModal';

type EstadoInscripcion = 'pendiente' | 'pagada' | 'anulada';

type Inscripcion = {
    id: number;
    persona: { id: number; nombre: string; documento: string } | null;
    preinscripcion_id: number | null;
    periodo: string | null;
    nivel: string;
    grado: string;
    grupo: string | null;
    sede: string;
    monto_inscripcion: number;
    monto_pagado: number;
    saldo_pendiente: number;
    estado: EstadoInscripcion;
    tiene_matricula: boolean;
    total_pagos: number;
    pagos_pendientes: number;
    fecha_inscripcion: string | null;
};

type PageProps = {
    inscripciones: Inscripcion[];
    periodo_actual?: string;
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

const ESTADO_CONFIG: Record<EstadoInscripcion, { label: string; variant: 'secondary' | 'success' | 'destructive'; icon: React.ComponentType<{ className?: string }> }> = {
    pendiente: { label: 'Pendiente de pago', variant: 'secondary', icon: Clock },
    pagada: { label: 'Pagada', variant: 'success', icon: CheckCircle2 },
    anulada: { label: 'Anulada', variant: 'destructive', icon: XCircle },
};

const NIVEL_LABEL: Record<string, string> = {
    primaria: 'Primaria',
    secundaria: 'Secundaria',
    preparatoria: 'Preparatoria',
};

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function Inscripciones() {
    const { props } = usePage<PageProps>();
    const { inscripciones, periodo_actual, flash, errors } = props;

    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<EstadoInscripcion | 'todas'>('todas');

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
        return inscripciones.filter((i) => {
            if (estadoFilter !== 'todas' && i.estado !== estadoFilter) return false;
            if (!q) return true;
            return (
                (i.persona?.nombre ?? '').toLowerCase().includes(q) ||
                (i.persona?.documento ?? '').toLowerCase().includes(q) ||
                (i.periodo ?? '').toLowerCase().includes(q)
            );
        });
    }, [inscripciones, search, estadoFilter]);

    const stats = useMemo(() => {
        return {
            total: inscripciones.length,
            pendientes: inscripciones.filter((i) => i.estado === 'pendiente').length,
            pagadas: inscripciones.filter((i) => i.estado === 'pagada').length,
            anuladas: inscripciones.filter((i) => i.estado === 'anulada').length,
            totalCobrado: inscripciones
                .filter((i) => i.estado === 'pagada')
                .reduce((acc, i) => acc + i.monto_pagado, 0),
            totalPendiente: inscripciones
                .filter((i) => i.estado === 'pendiente')
                .reduce((acc, i) => acc + i.saldo_pendiente, 0),
        };
    }, [inscripciones]);

    const verDetalle = (id: number) => router.visit(`/intranet/admisiones/inscripciones/${id}`);

    return (
        <>
            <Head title="Inscripciones" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inscripciones</h1>
                        <p className="text-gray-500">
                            Gestiona las inscripciones y sus pagos
                            {periodo_actual ? (
                                <>
                                    {' '}
                                    — <span className="font-semibold">{periodo_actual}</span>
                                </>
                            ) : null}
                        </p>
                    </div>
                    <NuevaInscripcionModal periodoActual={periodo_actual} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <UserPlus className="h-4 w-4 text-gray-500" />
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
                            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.pagadas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Anuladas</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.anuladas}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
                            <Banknote className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalCobrado)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Por cobrar</CardTitle>
                            <Banknote className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalPendiente)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre, documento o período…"
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-56">
                                <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v as EstadoInscripcion | 'todas')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todas">Todas</SelectItem>
                                        <SelectItem value="pendiente">Pendientes</SelectItem>
                                        <SelectItem value="pagada">Pagadas</SelectItem>
                                        <SelectItem value="anulada">Anuladas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Inscripciones</CardTitle>
                        <CardDescription>
                            {filtered.length} de {inscripciones.length} mostradas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Nivel / Grado</TableHead>
                                    <TableHead>Sede</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-right">Pagado</TableHead>
                                    <TableHead className="text-right">Saldo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                                            No hay inscripciones que coincidan con los filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((i) => {
                                        const cfg = ESTADO_CONFIG[i.estado];
                                        const Icon = cfg.icon;
                                        return (
                                            <TableRow key={i.id}>
                                                <TableCell className="font-medium">
                                                    {i.persona?.nombre ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{i.persona?.documento ?? '—'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{NIVEL_LABEL[i.nivel] ?? i.nivel}</div>
                                                        <div className="text-gray-500">
                                                            {i.grado}
                                                            {i.grupo ? ` · ${i.grupo}` : ''}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{i.sede}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(i.monto_inscripcion)}</TableCell>
                                                <TableCell className="text-right text-emerald-600 font-medium">
                                                    {formatCurrency(i.monto_pagado)}
                                                </TableCell>
                                                <TableCell className="text-right text-orange-600 font-medium">
                                                    {formatCurrency(i.saldo_pendiente)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={cfg.variant}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {cfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{formatDate(i.fecha_inscripcion)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => verDetalle(i.id)}>
                                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                                        Ver
                                                    </Button>
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
        </>
    );
}