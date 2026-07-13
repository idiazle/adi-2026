import { Head, usePage } from '@inertiajs/react';
import { Filter, GraduationCap, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

type EstadoMatricula = 'activa' | 'baja' | 'finalizada';
type Sede = 'central' | 'norte' | 'sur';

type Alumno = {
    id: number;
    matricula_id: number | null;
    estado_matricula: EstadoMatricula | null;
    fecha_matricula: string | null;
    persona: {
        id: number;
        nombre: string;
        documento: string;
        documento_tipo: string | null;
        documento_numero: string | null;
    } | null;
    periodo: string | null;
    nivel: string;
    grado: string;
    grupo: string | null;
    sede: string;
};

type PageProps = {
    alumnos: Alumno[];
    periodo: { id: number; codigo: string; nombre: string } | null;
    flash?: { success?: string; error?: string };
};

const NIVEL_LABEL: Record<string, string> = {
    primaria: 'Primaria',
    secundaria: 'Secundaria',
    preparatoria: 'Preparatoria',
};

const SEDE_LABEL: Record<string, string> = {
    central: 'Central',
    norte: 'Norte',
    sur: 'Sur',
};

const ESTADO_MATRICULA_CONFIG: Record<EstadoMatricula, { label: string; variant: 'success' | 'secondary' | 'destructive' }> = {
    activa: { label: 'Activa', variant: 'success' },
    baja: { label: 'Baja', variant: 'destructive' },
    finalizada: { label: 'Finalizada', variant: 'secondary' },
};

const SEDE_TODAS = 'todas' as const;
type SedeFilter = Sede | typeof SEDE_TODAS;

const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function Alumnos() {
    const { props } = usePage<PageProps>();
    const { alumnos, periodo, flash } = props;

    const [search, setSearch] = useState('');
    const [sedeFilter, setSedeFilter] = useState<SedeFilter>(SEDE_TODAS);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Conjunto de sedes presentes en los datos (para no mostrar opciones vacías).
    const sedesDisponibles = useMemo(() => {
        const set = new Set<string>();
        alumnos.forEach((a) => set.add(a.sede));
        return Array.from(set).sort();
    }, [alumnos]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return alumnos.filter((a) => {
            if (sedeFilter !== SEDE_TODAS && a.sede !== sedeFilter) return false;
            if (!q) return true;
            return (
                (a.persona?.nombre ?? '').toLowerCase().includes(q) ||
                (a.persona?.documento ?? '').toLowerCase().includes(q)
            );
        });
    }, [alumnos, search, sedeFilter]);

    return (
        <>
            <Head title="Alumnos" />

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Alumnos
                        </h1>
                        <p className="text-gray-500">
                            Inscripciones pagadas con matrícula activa
                            {periodo && (
                                <span className="ml-1">
                                    · Período <span className="font-medium">{periodo.nombre}</span>
                                    {periodo.codigo && (
                                        <span className="text-gray-400"> ({periodo.codigo})</span>
                                    )}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="success">{alumnos.length} activos</Badge>
                        {filtered.length !== alumnos.length && (
                            <Badge variant="secondary">{filtered.length} filtrados</Badge>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </CardTitle>
                        <CardDescription>
                            Refina el listado por nombre, documento o sede.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label htmlFor="search" className="text-sm font-medium text-gray-700">
                                    Buscar
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nombre, apellido o documento…"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="sede" className="text-sm font-medium text-gray-700">
                                    Sede
                                </label>
                                <Select value={sedeFilter} onValueChange={(v) => setSedeFilter(v as SedeFilter)}>
                                    <SelectTrigger id="sede">
                                        <SelectValue placeholder="Todas las sedes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SEDE_TODAS}>Todas las sedes</SelectItem>
                                        {sedesDisponibles.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {SEDE_LABEL[s] ?? s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Alumnos</CardTitle>
                        <CardDescription>
                            {filtered.length} de {alumnos.length} mostrados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Nivel / Grado / Grupo</TableHead>
                                    <TableHead>Sede</TableHead>
                                    <TableHead>Estado matrícula</TableHead>
                                    <TableHead>Fecha matrícula</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                            {alumnos.length === 0
                                                ? 'No hay alumnos matriculados en el período actual.'
                                                : 'Ningún alumno coincide con los filtros aplicados.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((a) => {
                                        const cfg = a.estado_matricula
                                            ? ESTADO_MATRICULA_CONFIG[a.estado_matricula]
                                            : null;
                                        return (
                                            <TableRow key={a.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                                        {a.persona?.nombre ?? '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {a.persona?.documento ?? '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{NIVEL_LABEL[a.nivel] ?? a.nivel}</div>
                                                        <div className="text-gray-500">
                                                            {a.grado}
                                                            {a.grupo ? ` · ${a.grupo}` : ''}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {SEDE_LABEL[a.sede] ?? a.sede}
                                                </TableCell>
                                                <TableCell>
                                                    {cfg ? (
                                                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {formatDate(a.fecha_matricula)}
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