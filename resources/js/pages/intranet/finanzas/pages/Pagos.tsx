import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, CheckCircle2, Download, Eye, Receipt, Search, XCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

type EstadoPago = 'pendiente' | 'validado' | 'rechazado';
type MetodoPago = 'efectivo' | 'transferencia' | 'yape' | 'plin' | 'otro';

type Pago = {
    id: number;
    monto: number;
    metodo: MetodoPago;
    estado: EstadoPago;
    referencia: string | null;
    comprobante_url: string | null;
    fecha_pago: string | null;
    fecha_validacion: string | null;
    motivo_rechazo: string | null;
    notas: string | null;
    created_at: string | null;
    inscripcion: {
        id: number;
        persona: string | null;
        documento: string | null;
        periodo: string | null;
        monto_inscripcion: number;
        monto_pagado: number;
        saldo_pendiente: number;
    } | null;
    concepto: string | null;
    validador: string | null;
};

type PageProps = {
    pagos: { data: Pago[]; links?: unknown; meta?: unknown } | Pago[];
    estado: EstadoPago;
    filtros: { estados: Record<EstadoPago, string> };
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

const ESTADO_CONFIG: Record<EstadoPago, { label: string; variant: 'secondary' | 'success' | 'destructive' }> = {
    pendiente: { label: 'Pendiente', variant: 'secondary' },
    validado: { label: 'Validado', variant: 'success' },
    rechazado: { label: 'Rechazado', variant: 'destructive' },
};

const METODO_LABEL: Record<MetodoPago, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    yape: 'Yape',
    plin: 'Plin',
    otro: 'Otro',
};

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Pagos() {
    const { props } = usePage<PageProps>();
    const { pagos, estado, filtros, flash, errors } = props;

    // Soportar tanto array simple como paginated (data/links/meta)
    const pagosList: Pago[] = Array.isArray(pagos) ? pagos : pagos?.data ?? [];
    const links = !Array.isArray(pagos) ? pagos?.links : undefined;

    const [search, setSearch] = useState('');
    const [decidirTarget, setDecidirTarget] = useState<Pago | null>(null);
    const [accion, setAccion] = useState<'validar' | 'rechazar'>('validar');
    const [motivo, setMotivo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [comprobanteModal, setComprobanteModal] = useState<{ url: string; pagoId: number; nombre: string | null } | null>(null);

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
        if (!q) return pagosList;
        return pagosList.filter((p) => {
            return (
                (p.inscripcion?.persona ?? '').toLowerCase().includes(q) ||
                (p.inscripcion?.documento ?? '').toLowerCase().includes(q) ||
                (p.referencia ?? '').toLowerCase().includes(q) ||
                String(p.id).includes(q)
            );
        });
    }, [pagosList, search]);

    const openDecidir = (p: Pago, acc: 'validar' | 'rechazar') => {
        setDecidirTarget(p);
        setAccion(acc);
        setMotivo('');
    };

    const handleDecidir = (e: React.FormEvent) => {
        e.preventDefault();
        if (!decidirTarget) return;
        if (accion === 'rechazar' && !motivo.trim()) {
            toast.error('Indica el motivo del rechazo.');
            return;
        }

        setSubmitting(true);
        router.post(
            `/intranet/finanzas/pagos/${decidirTarget.id}/decidir`,
            { accion, motivo_rechazo: accion === 'rechazar' ? motivo : null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    setDecidirTarget(null);
                    setMotivo('');
                },
                onError: (errs) => {
                    setSubmitting(false);
                    const first = Object.values(errs)[0];
                    if (first) toast.error(first);
                },
            }
        );
    };

    const cambiarEstado = (nuevoEstado: EstadoPago) => {
        router.get('/intranet/finanzas/pagos', { estado: nuevoEstado }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Cola de Pagos" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cola de Pagos</h1>
                    <p className="text-gray-500">Valida o rechaza los pagos subidos por secretaría o postulantes</p>
                </div>

                {/* Filtros por estado */}
                <div className="flex gap-2">
                    {Object.entries(filtros.estados).map(([key, label]) => (
                        <Button
                            key={key}
                            variant={estado === key ? 'default' : 'outline'}
                            onClick={() => cambiarEstado(key as EstadoPago)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Buscador */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre, documento, referencia o #pago…"
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle>{filtros.estados[estado]}</CardTitle>
                        <CardDescription>
                            {filtered.length} pago(s) {estado === 'pendiente' ? 'por revisar' : 'en este estado'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Persona</TableHead>
                                    <TableHead>Inscripción</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead>Comprobante</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                                            No hay pagos en este estado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((p) => {
                                        const cfg = ESTADO_CONFIG[p.estado];
                                        return (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-mono text-xs">#{p.id}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{p.inscripcion?.persona ?? '—'}</div>
                                                    <div className="text-xs text-gray-500">{p.inscripcion?.documento ?? '—'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {p.inscripcion ? (
                                                        <a
                                                            href={`/intranet/admisiones/inscripciones/${p.inscripcion.id}`}
                                                            className="text-blue-600 hover:underline text-sm"
                                                        >
                                                            Inscripción #{p.inscripcion.id}
                                                        </a>
                                                    ) : (
                                                        '—'
                                                    )}
                                                    {p.inscripcion && (
                                                        <div className="text-xs text-gray-500">
                                                            Pagado: {formatCurrency(p.inscripcion.monto_pagado)} /{' '}
                                                            {formatCurrency(p.inscripcion.monto_inscripcion)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>{formatDate(p.fecha_pago)}</div>
                                                    <div className="text-xs text-gray-500">{formatDateTime(p.created_at)}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>{METODO_LABEL[p.metodo]}</div>
                                                    {p.referencia && (
                                                        <div className="text-xs text-gray-500">{p.referencia}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(p.monto)}</TableCell>
                                                <TableCell>
                                                    {p.comprobante_url ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setComprobanteModal({
                                                                    url: p.comprobante_url!,
                                                                    pagoId: p.id,
                                                                    nombre: p.inscripcion?.persona ?? null,
                                                                })
                                                            }
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Ver
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Sin archivo</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                                    {p.motivo_rechazo && (
                                                        <div className="text-xs text-red-600 mt-1 max-w-xs">{p.motivo_rechazo}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {p.estado === 'pendiente' && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => openDecidir(p, 'validar')}
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                                Validar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => openDecidir(p, 'rechazar')}
                                                            >
                                                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                Rechazar
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {p.estado !== 'pendiente' && p.validador && (
                                                        <div className="text-xs text-gray-500">por {p.validador}</div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación simple (si Laravel devuelve links) */}
                        {Array.isArray(links) && links.length > 0 && (
                            <div className="flex justify-center gap-1 mt-4">
                                {(links as Array<{ url: string | null; label: string; active: boolean }>).map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de decisión */}
            <Dialog open={!!decidirTarget} onOpenChange={(open) => !open && setDecidirTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {accion === 'validar' ? 'Validar pago' : 'Rechazar pago'}
                        </DialogTitle>
                        <DialogDescription>
                            Pago #{decidirTarget?.id} de {decidirTarget?.inscripcion?.persona} por{' '}
                            {decidirTarget ? formatCurrency(decidirTarget.monto) : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDecidir} className="space-y-4">
                        {decidirTarget?.comprobante_url && (
                            <button
                                type="button"
                                onClick={() =>
                                    setComprobanteModal({
                                        url: decidirTarget.comprobante_url!,
                                        pagoId: decidirTarget.id,
                                        nombre: decidirTarget.inscripcion?.persona ?? null,
                                    })
                                }
                                className="w-full text-center bg-gray-50 border rounded p-3 text-sm text-blue-600 hover:bg-blue-50 hover:underline flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Ver comprobante adjunto antes de decidir
                            </button>
                        )}

                        {accion === 'rechazar' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="motivo">Motivo del rechazo *</Label>
                                <Input
                                    id="motivo"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Monto incorrecto, comprobante ilegible, etc."
                                    maxLength={500}
                                    required
                                />
                            </div>
                        )}

                        {accion === 'validar' && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-sm text-emerald-800">
                                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                                Al validar, el monto se sumará a la inscripción. Si cubre el total,
                                se creará automáticamente la matrícula.
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setDecidirTarget(null)}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                variant={accion === 'rechazar' ? 'destructive' : 'default'}
                            >
                                {submitting ? 'Procesando...' : accion === 'validar' ? 'Confirmar validación' : 'Confirmar rechazo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: previsualización del comprobante adjunto.
                Se renderiza por encima del modal de decidir si ambos están abiertos,
                para que el operador pueda revisar el archivo y luego decidir. */}
            <Dialog open={!!comprobanteModal} onOpenChange={(open) => !open && setComprobanteModal(null)}>
                <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Comprobante de pago
                            {comprobanteModal && (
                                <span className="text-sm font-normal text-gray-500">
                                    · Pago #{comprobanteModal.pagoId}
                                    {comprobanteModal.nombre ? ` · ${comprobanteModal.nombre}` : ''}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Revisa el comprobante antes de validar o rechazar el pago.
                        </DialogDescription>
                    </DialogHeader>

                    {comprobanteModal && (
                        <div className="space-y-3">
                            {/\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(comprobanteModal.url) ? (
                                <div className="bg-gray-50 rounded-md p-2 flex justify-center">
                                    <img
                                        src={comprobanteModal.url}
                                        alt={`Comprobante del pago #${comprobanteModal.pagoId}`}
                                        className="max-h-[70vh] w-auto object-contain rounded"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-md p-2">
                                    <iframe
                                        src={comprobanteModal.url}
                                        title={`Comprobante del pago #${comprobanteModal.pagoId}`}
                                        className="w-full h-[70vh] rounded border-0"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setComprobanteModal(null)}
                                >
                                    Cerrar
                                </Button>
                                <a
                                    href={comprobanteModal.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
                                >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Abrir en pestaña nueva
                                </a>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}