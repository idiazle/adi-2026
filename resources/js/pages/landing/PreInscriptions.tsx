import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

type PageProps = {
    flash?: {
        success?: string;
        preinscripcion_id?: number;
    };
    errors?: Record<string, string>;
};

type FormData = {
    apellidos: string;
    nombres: string;
    tipo_documento: string;
    numero_documento: string;
    email: string;
    telefono: string;
    direccion: string;
    grado: string;
};

const TIPOS_DOCUMENTO = [
    { value: 'DNI', label: 'DNI - Documento Nacional de Identidad' },
    { value: 'CE', label: 'CE - Carné de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'PTP', label: 'PTP - Permiso Temporal de Permanencia' },
];

const GRADOS = [
    '1ro de Primaria',
    '2do de Primaria',
    '3ro de Primaria',
    '4to de Primaria',
    '5to de Primaria',
    '6to de Primaria',
    '1ro de Secundaria',
    '2do de Secundaria',
    '3ro de Secundaria',
    '4to de Secundaria',
    '5to de Secundaria',
    '1ro de Preparatoria',
];

const PreInscriptions = () => {
    const { props } = usePage<PageProps>();
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        apellidos: '',
        nombres: '',
        tipo_documento: '',
        numero_documento: '',
        email: '',
        telefono: '',
        direccion: '',
        grado: '',
    });

    useEffect(() => {
        if (props.flash?.success) {
            setShowSuccess(true);
            reset();
            const timer = setTimeout(() => setShowSuccess(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [props.flash?.success, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/crem/preinscripciones', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Preinscripciones - CREM" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Encabezado */}
                    <header className="text-center mb-10">
                        <div className="inline-flex w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center text-3xl mb-4 shadow-lg">
                            🏆
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                            Preinscripción
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
                            Completa el siguiente formulario para registrar tu participación en el
                            concurso académico. Todos los campos son obligatorios.
                        </p>
                    </header>

                    {/* Mensaje de éxito */}
                    {showSuccess && (
                        <div
                            role="alert"
                            className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-800 flex items-start gap-3"
                        >
                            <span className="text-2xl" aria-hidden="true">
                                ✅
                            </span>
                            <div>
                                <p className="font-semibold">¡Preinscripción registrada!</p>
                                <p className="text-sm">
                                    {props.flash?.success ??
                                        'Tu registro fue exitoso. Te contactaremos pronto.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Formulario */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            {/* Datos personales */}
                            <fieldset>
                                <legend className="text-lg font-semibold text-gray-900 mb-4">
                                    Datos Personales
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Apellidos */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="apellidos">
                                            Apellidos <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="apellidos"
                                            type="text"
                                            value={data.apellidos}
                                            onChange={(e) =>
                                                setData('apellidos', e.target.value)
                                            }
                                            placeholder="Pérez García"
                                            autoComplete="family-name"
                                            disabled={processing}
                                            aria-invalid={!!errors.apellidos}
                                        />
                                        {errors.apellidos && (
                                            <p className="text-sm text-red-500">
                                                {errors.apellidos}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nombres */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="nombres">
                                            Nombres <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="nombres"
                                            type="text"
                                            value={data.nombres}
                                            onChange={(e) => setData('nombres', e.target.value)}
                                            placeholder="Juan Carlos"
                                            autoComplete="given-name"
                                            disabled={processing}
                                            aria-invalid={!!errors.nombres}
                                        />
                                        {errors.nombres && (
                                            <p className="text-sm text-red-500">{errors.nombres}</p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Documento de identidad */}
                            <fieldset>
                                <legend className="text-lg font-semibold text-gray-900 mb-4">
                                    Documento de Identidad
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Tipo de documento */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="tipo_documento">
                                            Tipo de Documento{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.tipo_documento}
                                            onValueChange={(value) =>
                                                setData('tipo_documento', value)
                                            }
                                            disabled={processing}
                                        >
                                            <SelectTrigger
                                                id="tipo_documento"
                                                className="w-full"
                                                aria-invalid={!!errors.tipo_documento}
                                            >
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIPOS_DOCUMENTO.map((tipo) => (
                                                    <SelectItem
                                                        key={tipo.value}
                                                        value={tipo.value}
                                                    >
                                                        {tipo.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tipo_documento && (
                                            <p className="text-sm text-red-500">
                                                {errors.tipo_documento}
                                            </p>
                                        )}
                                    </div>

                                    {/* Número de documento */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="numero_documento">
                                            Número de Documento{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="numero_documento"
                                            type="text"
                                            value={data.numero_documento}
                                            onChange={(e) =>
                                                setData('numero_documento', e.target.value)
                                            }
                                            placeholder="12345678"
                                            disabled={processing}
                                            aria-invalid={!!errors.numero_documento}
                                        />
                                        {errors.numero_documento && (
                                            <p className="text-sm text-red-500">
                                                {errors.numero_documento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Datos de contacto */}
                            <fieldset>
                                <legend className="text-lg font-semibold text-gray-900 mb-4">
                                    Datos de Contacto
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Correo electrónico */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">
                                            Correo Electrónico{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            autoComplete="email"
                                            disabled={processing}
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Teléfono */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="telefono">
                                            Teléfono <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="telefono"
                                            type="tel"
                                            value={data.telefono}
                                            onChange={(e) => setData('telefono', e.target.value)}
                                            placeholder="+51 999 999 999"
                                            autoComplete="tel"
                                            disabled={processing}
                                            aria-invalid={!!errors.telefono}
                                        />
                                        {errors.telefono && (
                                            <p className="text-sm text-red-500">
                                                {errors.telefono}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className="flex flex-col gap-2 mt-5">
                                    <Label htmlFor="direccion">
                                        Dirección <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="direccion"
                                        type="text"
                                        value={data.direccion}
                                        onChange={(e) => setData('direccion', e.target.value)}
                                        placeholder="Av. Ejemplo 123, Distrito, Ciudad"
                                        autoComplete="street-address"
                                        disabled={processing}
                                        aria-invalid={!!errors.direccion}
                                    />
                                    {errors.direccion && (
                                        <p className="text-sm text-red-500">{errors.direccion}</p>
                                    )}
                                </div>
                            </fieldset>

                            {/* Grado/Año */}
                            <fieldset>
                                <legend className="text-lg font-semibold text-gray-900 mb-4">
                                    Información Académica
                                </legend>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="grado">
                                        Grado / Año <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.grado}
                                        onValueChange={(value) => setData('grado', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger
                                            id="grado"
                                            className="w-full"
                                            aria-invalid={!!errors.grado}
                                        >
                                            <SelectValue placeholder="Selecciona el grado que cursas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADOS.map((g) => (
                                                <SelectItem key={g} value={g}>
                                                    {g}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grado && (
                                        <p className="text-sm text-red-500">{errors.grado}</p>
                                    )}
                                </div>
                            </fieldset>

                            {/* Botón de envío */}
                            <div className="pt-4 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto sm:px-8 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    {processing
                                        ? 'Enviando preinscripción...'
                                        : 'Enviar preinscripción'}
                                </Button>
                                <p className="text-xs text-gray-500 mt-3">
                                    Al enviar este formulario aceptas que nos contactemos contigo
                                    para completar el proceso de inscripción.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Pie */}
                    <footer className="text-center text-sm text-gray-400 mt-8">
                        <p>
                            ¿Tienes dudas? Escríbenos a{' '}
                            <a
                                href="mailto:contacto@academia.edu"
                                className="text-amber-600 hover:underline"
                            >
                                contacto@academia.edu
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default PreInscriptions;
