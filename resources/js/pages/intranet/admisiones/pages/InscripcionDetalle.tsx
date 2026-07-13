import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    Eye,
    FileText,
    IdCard,
    Receipt,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

type EstadoInscripcion = 'pendiente' | 'pagada' | 'anulada';
type EstadoPago = 'pendiente' | 'validado' | 'rechazado';
type MetodoPago = 'efectivo' | 'transferencia' | 'yape' | 'plin' | 'otro';

type Pago = {
    id: number;
    monto: number;
    metodo: MetodoPago;
    referencia: string | null;
    comprobante_url: string | null;
    estado: EstadoPago;
    fecha_pago: string | null;
    fecha_validacion: string | null;
    motivo_rechazo: string | null;
    notas: string | null;
    validador: string | null;
    registrador: string | null;
    created_at: string | null;
};

type Inscripcion = {
    id: number;
    estado: EstadoInscripcion;
    nivel: string;
    grado: string;
    grupo: string | null;
    sede: string;
    monto_inscripcion: number;
    monto_pagado: number;
    saldo_pendiente: number;
    notas: string | null;
    created_at: string | null;
    persona: { id: number; nombre: string; documento: string; telefono: string | null; nacimiento: string | null } | null;
    periodo: { id: number; nombre: string; codigo: string } | null;
    preinscripcion: { id: number; estado: string; origen: string } | null;
    creador: string | null;
    tiene_matricula: boolean;
    matricula: { id: number; estado: string } | null;
    pagos: Pago[];
};

type PageProps = {
    inscripcion: Inscripcion;
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

const ESTADO_INSCRIPCION_CONFIG: Record<EstadoInscripcion, { label: string; variant: 'secondary' | 'success' | 'destructive' }> = {
    pendiente: { label: 'Pendiente de pago', variant: 'secondary' },
    pagada: { label: 'Pagada', variant: 'success' },
    anulada: { label: 'Anulada', variant: 'destructive' },
};

const ESTADO_PAGO_CONFIG: Record<EstadoPago, { label: string; variant: 'secondary' | 'success' | 'destructive' }> = {
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

const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function InscripcionDetalle() {
    const { props } = usePage<PageProps>();
    const { inscripcion, flash, errors } = props;

    const [showForm, setShowForm] = useState(false);
    const [monto, setMonto] = useState('');
    const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
    const [referencia, setReferencia] = useState('');
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
    const [notas, setNotas] = useState('');
    const [comprobante, setComprobante] = useState<File | null>(null);
    const [comprobanteModal, setComprobanteModal] = useState<{ url: string; pagoId: number; nombre: string | null } | null>(null);
    const [submitting, setSubmitting] = useState(false);

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

    // Sugerir el saldo pendiente como monto por defecto al abrir el form
    useEffect(() => {
        if (showForm && inscripcion.saldo_pendiente > 0) {
            setMonto(inscripcion.saldo_pendiente.toFixed(2));
        }
    }, [showForm, inscripcion.saldo_pendiente]);

    const porcentajePagado = useMemo(() => {
        if (inscripcion.monto_inscripcion <= 0) return 0;
        return Math.min(100, (inscripcion.monto_pagado / inscripcion.monto_inscripcion) * 100);
    }, [inscripcion.monto_inscripcion, inscripcion.monto_pagado]);

    const handleRegistrarPago = (e: React.FormEvent) => {
        e.preventDefault();

        const montoNum = parseFloat(monto);
        if (!montoNum || montoNum <= 0) {
            toast.error('Ingresa un monto válido.');
            return;
        }

        const formData = new FormData();
        formData.append('monto', monto);
        formData.append('metodo', metodo);
        formData.append('fecha_pago', fechaPago);
        if (referencia) formData.append('referencia_externa', referencia);
        if (notas) formData.append('notas', notas);
        if (comprobante) formData.append('comprobante', comprobante);

        setSubmitting(true);
        router.post(`/intranet/admisiones/inscripciones/${inscripcion.id}/pagos`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSubmitting(false);
                setShowForm(false);
                setMonto('');
                setReferencia('');
                setNotas('');
                setComprobante(null);
            },
            onError: (errs) => {
                setSubmitting(false);
                const first = Object.values(errs)[0];
                if (first) toast.error(first);
            },
        });
    };

    const inscripcionCfg = ESTADO_INSCRIPCION_CONFIG[inscripcion.estado];
    const puedeRegistrarPago = inscripcion.estado === 'pendiente';

    return (
        <>
            <Head title={`Inscripción #${inscripcion.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Button variant="ghost" size="sm" onClick={() => router.visit('/intranet/admisiones/inscripciones')}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Volver
                            </Button>
                            <span>/</span>
                            <span>Inscripción #{inscripcion.id}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {inscripcion.persona?.nombre ?? 'Sin persona asociada'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={inscripcionCfg.variant}>{inscripcionCfg.label}</Badge>
                            {inscripcion.tiene_matricula && (
                                <Badge variant="success">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Matriculado #{inscripcion.matricula?.id}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda: info académica + persona */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resumen de pago */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5" />
                                    Resumen de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 uppercase">Monto total</div>
                                        <div className="text-xl font-bold">{formatCurrency(inscripcion.monto_inscripcion)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 uppercase">Pagado</div>
                                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(inscripcion.monto_pagado)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500 uppercase">Saldo</div>
                                        <div className="text-xl font-bold text-orange-600">{formatCurrency(inscripcion.saldo_pendiente)}</div>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{porcentajePagado.toFixed(0)}% pagado</span>
                                        <span>{inscripcion.pagos.length} pago(s) registrado(s)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-emerald-500 h-2.5 rounded-full transition-all"
                                            style={{ width: `${porcentajePagado}%` }}
                                        />
                                    </div>
                                </div>

                                {puedeRegistrarPago && (
                                    <Button onClick={() => setShowForm(!showForm)} className="w-full">
                                        <Receipt className="h-4 w-4 mr-2" />
                                        {showForm ? 'Cancelar' : 'Registrar nuevo pago'}
                                    </Button>
                                )}

                                {showForm && (
                                    <form onSubmit={handleRegistrarPago} className="space-y-4 border-t pt-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="monto">Monto *</Label>
                                                <Input
                                                    id="monto"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={monto}
                                                    onChange={(e) => setMonto(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="metodo">Método *</Label>
                                                <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)}>
                                                    <SelectTrigger id="metodo">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                                        <SelectItem value="yape">Yape</SelectItem>
                                                        <SelectItem value="plin">Plin</SelectItem>
                                                        <SelectItem value="otro">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="fecha_pago">Fecha del pago</Label>
                                                <Input
                                                    id="fecha_pago"
                                                    type="date"
                                                    value={fechaPago}
                                                    onChange={(e) => setFechaPago(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="referencia">Referencia (opcional)</Label>
                                                <Input
                                                    id="referencia"
                                                    value={referencia}
                                                    onChange={(e) => setReferencia(e.target.value)}
                                                    placeholder="Nro de operación"
                                                    maxLength={100}
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1.5">
                                                <Label htmlFor="comprobante">Comprobante (imagen/PDF)</Label>
                                                <Input
                                                    id="comprobante"
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1.5">
                                                <Label htmlFor="notas">Notas (opcional)</Label>
                                                <Input
                                                    id="notas"
                                                    value={notas}
                                                    onChange={(e) => setNotas(e.target.value)}
                                                    placeholder="Comentario interno"
                                                    maxLength={500}
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submitting} className="w-full">
                                            {submitting ? 'Registrando...' : 'Confirmar pago'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Historial de pagos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Historial de Pagos
                                </CardTitle>
                                <CardDescription>{inscripcion.pagos.length} pago(s) registrado(s)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inscripcion.pagos.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">No hay pagos registrados aún.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Validado por</TableHead>
                                                <TableHead>Comprobante</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inscripcion.pagos.map((p) => {
                                                const cfg = ESTADO_PAGO_CONFIG[p.estado];
                                                return (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-mono text-xs">#{p.id}</TableCell>
                                                        <TableCell className="text-sm">
                                                            <div>{formatDate(p.fecha_pago)}</div>
                                                            <div className="text-xs text-gray-500">{formatDateTime(p.created_at)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{METODO_LABEL[p.metodo]}</div>
                                                                {p.referencia && <div className="text-xs text-gray-500">{p.referencia}</div>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(p.monto)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                                            {p.motivo_rechazo && (
                                                                <div className="text-xs text-red-600 mt-1">{p.motivo_rechazo}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {p.validador ?? '—'}
                                                        </TableCell>
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
                                                                            nombre: inscripcion.persona?.nombre ?? null,
                                                                        })
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                                    Ver
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">—</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna derecha: info persona + académico */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4" />
                                    Persona
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {inscripcion.persona ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <IdCard className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <div className="font-medium">{inscripcion.persona.nombre}</div>
                                                <div className="text-gray-500">{inscripcion.persona.documento}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            {inscripcion.persona.telefono ?? 'Sin teléfono'}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            Nac: {formatDate(inscripcion.persona.nacimiento)}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">Sin persona asociada.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4" />
                                    Detalle Académico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nivel:</span>
                                    <span className="font-medium">{NIVEL_LABEL[inscripcion.nivel] ?? inscripcion.nivel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grado:</span>
                                    <span className="font-medium">{inscripcion.grado}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grupo:</span>
                                    <span className="font-medium">{inscripcion.grupo ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sede:</span>
                                    <span className="font-medium capitalize">{inscripcion.sede}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Período:</span>
                                        <span className="font-medium">{inscripcion.periodo?.nombre ?? '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Código:</span>
                                        <span className="font-mono text-xs">{inscripcion.periodo?.codigo ?? '—'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4" />
                                    Auditoría
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Creado:</span>
                                    <span>{formatDateTime(inscripcion.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Por:</span>
                                    <span>{inscripcion.creador ?? '—'}</span>
                                </div>
                                {inscripcion.preinscripcion && (
                                    <div className="border-t pt-2 mt-2 text-xs">
                                        <span className="text-gray-500">Origen:</span>{' '}
                                        <a
                                            href={`/intranet/admisiones/preinscripciones`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Preinscripción #{inscripcion.preinscripcion.id} ({inscripcion.preinscripcion.estado})
                                        </a>
                                    </div>
                                )}
                                {inscripcion.tiene_matricula && (
                                    <div className="border-t pt-2 mt-2 text-xs">
                                        <span className="text-gray-500">Matrícula:</span>{' '}
                                        <Badge variant="success">#{inscripcion.matricula?.id} {inscripcion.matricula?.estado}</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal: previsualización del comprobante adjunto */}
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
                            Comprobante adjunto al pago registrado en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {comprobanteModal && (
                        <div className="space-y-3">
                            {/* Si es imagen, se muestra inline. Si es PDF u otro,
                                se ofrece un enlace de descarga + visor en iframe. */}
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