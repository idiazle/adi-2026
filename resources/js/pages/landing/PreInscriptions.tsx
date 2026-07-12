import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, GraduationCap, ShieldCheck, User, Users } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

type Periodo = {
    id: number;
    nombre: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    preinscripciones_apertura: string | null;
    preinscripciones_cierre: string | null;
};

type PageProps = {
    periodo: Periodo | null;
    abierto: boolean;
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
};

type Sexo = 'M' | 'F';
type Nivel = 'primaria' | 'secundaria' | 'preparatoria';
type Parentesco = 'madre' | 'padre' | 'tutor' | 'abuelo' | 'hermano' | 'otro';

type FormValues = {
    // Estudiante
    apellidos: string;
    nombres: string;
    tipo_documento: 'DNI' | 'CE' | 'PAS' | 'PTP' | '';
    numero_documento: string;
    fecha_nacimiento: string;
    sexo: Sexo | '';

    // Académico
    nivel: Nivel | '';
    grado: string;
    grupo: string;

    // Tutor
    nombre_tutor: string;
    telefono_tutor: string;
    email_tutor: string;
    parentesco_tutor: Parentesco | '';
};

const TIPO_DOCUMENTO_OPTIONS: { value: 'DNI' | 'CE' | 'PAS' | 'PTP'; label: string }[] = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'CE - Carné de Extranjería' },
    { value: 'PAS', label: 'PAS - Pasaporte' },
    { value: 'PTP', label: 'PTP - Permiso Temporal' },
];

const SEXO_OPTIONS: { value: Sexo; label: string }[] = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
];

const NIVEL_OPTIONS: { value: Nivel; label: string }[] = [
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'preparatoria', label: 'Preparatoria' },
];

const GRADOS_POR_NIVEL: Record<Nivel, { value: string; label: string }[]> = {
    primaria: [
        { value: '1ro', label: '1ro' },
        { value: '2do', label: '2do' },
        { value: '3ro', label: '3ro' },
        { value: '4to', label: '4to' },
        { value: '5to', label: '5to' },
        { value: '6to', label: '6to' },
    ],
    secundaria: [
        { value: '1ro', label: '1ro' },
        { value: '2do', label: '2do' },
        { value: '3ro', label: '3ro' },
        { value: '4to', label: '4to' },
        { value: '5to', label: '5to' },
    ],
    preparatoria: [
        { value: '1ro', label: '1ro' },
        { value: '2do', label: '2do' },
        { value: '3ro', label: '3ro' },
    ],
};

const PARENTESCO_OPTIONS: { value: Parentesco; label: string }[] = [
    { value: 'madre', label: 'Madre' },
    { value: 'padre', label: 'Padre' },
    { value: 'tutor', label: 'Tutor legal' },
    { value: 'abuelo', label: 'Abuelo(a)' },
    { value: 'hermano', label: 'Hermano(a)' },
    { value: 'otro', label: 'Otro' },
];

const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

const Field = ({
    id,
    label,
    required,
    error,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label htmlFor={id}>
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {children}
        {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
);

const PreInscriptions = () => {
    const { props } = usePage<PageProps>();
    const { periodo, abierto, flash, errors } = props;

    const EMPTY_FORM: FormValues = {
        apellidos: '',
        nombres: '',
        tipo_documento: '',
        numero_documento: '',
        fecha_nacimiento: '',
        sexo: '',
        nivel: '',
        grado: '',
        grupo: '',
        nombre_tutor: '',
        telefono_tutor: '',
        email_tutor: '',
        parentesco_tutor: '',
    };

    const { data, setData, post, processing, wasSuccessful, recentlySuccessful, reset, clearErrors } = useForm<FormValues>(EMPTY_FORM);

    const showSuccess = useMemo(() => wasSuccessful || Boolean(flash?.success), [wasSuccessful, flash?.success]);
    const gradosDisponibles = data.nivel ? GRADOS_POR_NIVEL[data.nivel] : [];

    // Tras un envío exitoso, limpiamos el formulario y los errores para que
    // el siguiente postulante empiece desde cero.
    useEffect(() => {
        if (wasSuccessful) {
            reset();
            clearErrors();
        }
    }, [wasSuccessful, reset, clearErrors]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/preinscripciones', { preserveScroll: true });
    };

    const handleNivelChange = (value: Nivel) => {
        // Resetear grado al cambiar de nivel para evitar combinaciones inválidas.
        setData((prev) => ({ ...prev, nivel: value, grado: '' }));
    };

    return (
        <>
            <Head title="Preinscripción - Academia" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Encabezado */}
                    <header className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al inicio
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                                🎓
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Formulario de Preinscripción
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Completa las tres secciones para reservar tu vacante en el período académico vigente.
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Banner de período activo */}
                    {periodo && (
                        <Card className="mb-6 border-blue-200 bg-blue-50/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-blue-900">{periodo.nombre}</CardTitle>
                                        <CardDescription className="text-blue-700/80">
                                            Período académico activo
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm text-blue-900/80 space-y-1">
                                {periodo.fecha_inicio && periodo.fecha_fin && (
                                    <p>
                                        <span className="font-medium">Ciclo:</span> {formatDate(periodo.fecha_inicio)} →{' '}
                                        {formatDate(periodo.fecha_fin)}
                                    </p>
                                )}
                                {(periodo.preinscripciones_apertura || periodo.preinscripciones_cierre) && (
                                    <p className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">Preinscripciones:</span>{' '}
                                        {formatDate(periodo.preinscripciones_apertura)} al{' '}
                                        {formatDate(periodo.preinscripciones_cierre)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Estado: preinscripciones cerradas */}
                    {!abierto && (
                        <Alert
                            variant="destructive"
                            className="mb-6 bg-amber-50 border-amber-300 text-amber-900 [&>svg]:text-amber-600"
                        >
                            <AlertCircle />
                            <AlertTitle>Preinscripciones cerradas</AlertTitle>
                            <AlertDescription>
                                {periodo
                                    ? 'El período activo no tiene preinscripciones abiertas en este momento. Vuelve más tarde o contacta a la academia.'
                                    : 'No hay un período de preinscripciones activo actualmente. Te invitamos a regresar cuando se abra una nueva convocatoria.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Confirmación de éxito */}
                    {showSuccess && (
                        <Alert className="mb-6 border-green-300 bg-green-50 text-green-900 [&>svg]:text-green-600">
                            <CheckCircle2 />
                            <AlertTitle>¡Preinscripción registrada!</AlertTitle>
                            <AlertDescription>
                                {flash?.success ??
                                    'Tu preinscripción fue registrada correctamente. Te contactaremos pronto.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <fieldset disabled={!abierto || processing} className="space-y-6">
                            {/* SECCIÓN 1: Datos del estudiante */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Datos del estudiante</CardTitle>
                                    </div>
                                    <CardDescription>Información personal del postulante.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field id="nombres" label="Nombres" required error={errors?.nombres}>
                                            <Input
                                                id="nombres"
                                                value={data.nombres}
                                                onChange={(e) => setData('nombres', e.target.value)}
                                                placeholder="Ej. María Fernanda"
                                                autoComplete="given-name"
                                                aria-invalid={Boolean(errors?.nombres)}
                                            />
                                        </Field>
                                        <Field id="apellidos" label="Apellidos" required error={errors?.apellidos}>
                                            <Input
                                                id="apellidos"
                                                value={data.apellidos}
                                                onChange={(e) => setData('apellidos', e.target.value)}
                                                placeholder="Ej. Pérez López"
                                                autoComplete="family-name"
                                                aria-invalid={Boolean(errors?.apellidos)}
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Field
                                            id="tipo_documento"
                                            label="Tipo de documento"
                                            required
                                            error={errors?.tipo_documento}
                                        >
                                            <Select
                                                value={data.tipo_documento}
                                                onValueChange={(value) =>
                                                    setData('tipo_documento', value as FormValues['tipo_documento'])
                                                }
                                            >
                                                <SelectTrigger
                                                    id="tipo_documento"
                                                    aria-invalid={Boolean(errors?.tipo_documento)}
                                                >
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIPO_DOCUMENTO_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <div className="sm:col-span-2">
                                            <Field
                                                id="numero_documento"
                                                label="Número de documento"
                                                required
                                                error={errors?.numero_documento}
                                            >
                                                <Input
                                                    id="numero_documento"
                                                    value={data.numero_documento}
                                                    onChange={(e) => setData('numero_documento', e.target.value)}
                                                    placeholder="Ej. 12345678"
                                                    maxLength={20}
                                                    aria-invalid={Boolean(errors?.numero_documento)}
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field
                                            id="fecha_nacimiento"
                                            label="Fecha de nacimiento"
                                            required
                                            error={errors?.fecha_nacimiento}
                                        >
                                            <Input
                                                id="fecha_nacimiento"
                                                type="date"
                                                value={data.fecha_nacimiento}
                                                onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                                max={new Date().toISOString().slice(0, 10)}
                                                aria-invalid={Boolean(errors?.fecha_nacimiento)}
                                            />
                                        </Field>
                                        <Field id="sexo" label="Sexo" required error={errors?.sexo}>
                                            <Select
                                                value={data.sexo}
                                                onValueChange={(value) => setData('sexo', value as Sexo)}
                                            >
                                                <SelectTrigger id="sexo" aria-invalid={Boolean(errors?.sexo)}>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SEXO_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SECCIÓN 2: Nivel y grado */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Nivel y grado</CardTitle>
                                    </div>
                                    <CardDescription>Indica el nivel académico al que postula.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Field id="nivel" label="Nivel" required error={errors?.nivel}>
                                            <Select
                                                value={data.nivel}
                                                onValueChange={(v) => handleNivelChange(v as Nivel)}
                                            >
                                                <SelectTrigger id="nivel" aria-invalid={Boolean(errors?.nivel)}>
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {NIVEL_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field id="grado" label="Grado" required error={errors?.grado}>
                                            <Select
                                                value={data.grado}
                                                onValueChange={(value) => setData('grado', value)}
                                                disabled={!data.nivel}
                                            >
                                                <SelectTrigger id="grado" aria-invalid={Boolean(errors?.grado)}>
                                                    <SelectValue
                                                        placeholder={data.nivel ? 'Selecciona...' : 'Elige nivel primero'}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {gradosDisponibles.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field id="grupo" label="Grupo" error={errors?.grupo}>
                                            <Input
                                                id="grupo"
                                                value={data.grupo}
                                                onChange={(e) => setData('grupo', e.target.value.toUpperCase())}
                                                placeholder="A, B, C..."
                                                maxLength={5}
                                                aria-invalid={Boolean(errors?.grupo)}
                                            />
                                        </Field>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SECCIÓN 3: Tutor o padre */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Datos del tutor o padre</CardTitle>
                                    </div>
                                    <CardDescription>Persona responsable del postulante.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Field
                                        id="nombre_tutor"
                                        label="Nombre completo del tutor"
                                        required
                                        error={errors?.nombre_tutor}
                                    >
                                        <Input
                                            id="nombre_tutor"
                                            value={data.nombre_tutor}
                                            onChange={(e) => setData('nombre_tutor', e.target.value)}
                                            placeholder="Ej. Juan Pérez García"
                                            autoComplete="name"
                                            aria-invalid={Boolean(errors?.nombre_tutor)}
                                        />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field
                                            id="parentesco_tutor"
                                            label="Parentesco"
                                            required
                                            error={errors?.parentesco_tutor}
                                        >
                                            <Select
                                                value={data.parentesco_tutor}
                                                onValueChange={(value) =>
                                                    setData('parentesco_tutor', value as Parentesco)
                                                }
                                            >
                                                <SelectTrigger
                                                    id="parentesco_tutor"
                                                    aria-invalid={Boolean(errors?.parentesco_tutor)}
                                                >
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PARENTESCO_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field
                                            id="telefono_tutor"
                                            label="Teléfono de contacto"
                                            required
                                            error={errors?.telefono_tutor}
                                        >
                                            <Input
                                                id="telefono_tutor"
                                                type="tel"
                                                value={data.telefono_tutor}
                                                onChange={(e) => setData('telefono_tutor', e.target.value)}
                                                placeholder="Ej. 987654321"
                                                maxLength={20}
                                                autoComplete="tel"
                                                aria-invalid={Boolean(errors?.telefono_tutor)}
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        id="email_tutor"
                                        label="Correo electrónico del tutor"
                                        required
                                        error={errors?.email_tutor}
                                    >
                                        <Input
                                            id="email_tutor"
                                            type="email"
                                            value={data.email_tutor}
                                            onChange={(e) => setData('email_tutor', e.target.value)}
                                            placeholder="tutor@ejemplo.com"
                                            autoComplete="email"
                                            maxLength={150}
                                            aria-invalid={Boolean(errors?.email_tutor)}
                                        />
                                    </Field>
                                </CardContent>
                            </Card>

                            {/* Error genérico del backend (ej. período) */}
                            {errors?.periodo && (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription>{errors.periodo}</AlertDescription>
                                </Alert>
                            )}
                        </fieldset>

                        {/* Acciones */}
                        <Card className="shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <p className="text-xs text-gray-500 flex items-start gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        Tus datos se usan únicamente para gestionar tu preinscripción.
                                    </p>
                                    <div className="flex gap-2 sm:justify-end">
                                        <Button asChild variant="outline" type="button" disabled={processing}>
                                            <Link href="/">Cancelar</Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!abierto || processing}
                                            className="min-w-[160px]"
                                        >
                                            {processing ? 'Enviando...' : 'Enviar preinscripción'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    {recentlySuccessful && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Formulario enviado. Si necesitas corregir datos, contacta a la academia.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default PreInscriptions;
