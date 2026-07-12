import { useState } from 'react';
import { router } from '@inertiajs/react';
import { store as inscripcionStore } from '@/routes/intranet/admisiones/inscripciones';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CheckCircle2, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface NuevaInscripcionModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  /** Periodo activo actualmente; el backend lo asigna automáticamente. */
  periodoActual?: string;
}

type NivelValue = 'primaria' | 'secundaria' | 'preparatoria' | '';

const GRADOS: Record<Exclude<NivelValue, ''>, { value: string; label: string }[]> = {
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

interface FormState {
  first_name: string;
  last_name: string;
  document_type: 'DNI' | 'CE' | 'PAS' | 'PTP' | '';
  document_number: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F' | 'O' | '';
  telefono: string;
  nivel: NivelValue;
  grado: string;
  grupo: string;
  sede: 'central' | 'norte' | 'sur' | '';
  tutor_first_name: string;
  tutor_last_name: string;
  telefono_tutor: string;
  parentesco_tutor: 'madre' | 'padre' | 'tutor' | 'abuelo' | 'hermano' | 'otro' | '';
}

const initialForm: FormState = {
  first_name: '',
  last_name: '',
  document_type: '',
  document_number: '',
  fecha_nacimiento: '',
  genero: '',
  telefono: '',
  nivel: '',
  grado: '',
  grupo: '',
  sede: '',
  tutor_first_name: '',
  tutor_last_name: '',
  telefono_tutor: '',
  parentesco_tutor: '',
};

export function NuevaInscripcionModal({ trigger, onSuccess, periodoActual }: NuevaInscripcionModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormState>(initialForm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'nivel' ? { grado: '' as string } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = (): boolean => {
    const required: (keyof FormState)[] = [
      'first_name', 'last_name', 'document_type', 'document_number',
      'fecha_nacimiento', 'nivel', 'grado', 'sede',
      'tutor_first_name', 'tutor_last_name', 'telefono_tutor', 'parentesco_tutor',
    ];
    const newErrors: Record<string, string> = {};
    required.forEach((field) => {
      if (!formData[field]) newErrors[field] = 'Campo obligatorio';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      setStep(1);
      setFormData(initialForm);
      setErrors({});
    }
    setOpen(openState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setIsLoading(true);
    router.post(
      inscripcionStore.url(),
      formData as unknown as Record<string, string>,
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsLoading(false);
          setOpen(false);
          setStep(1);
          setFormData(initialForm);
          onSuccess?.();
        },
        onError: (errs) => {
          setIsLoading(false);
          setErrors(errs as Record<string, string>);
          if (errs.document_number || errs.nivel || errs.sede || errs.document_type) setStep(1);
          // Error global del backend (p.ej. "no hay período activo"):
          // lo mostramos como toast y forzamos paso 1 para visibilidad.
          if (errs.periodo) {
            toast.error(errs.periodo);
            setStep(1);
          }
        },
      },
    );
  };

  const gradeOptions = formData.nivel ? GRADOS[formData.nivel as Exclude<NivelValue, ''>] : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Nueva Inscripción
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Inscripción Directa</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-4 py-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datos del Alumno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="first_name">Nombres *</Label>
                      <Input
                        id="first_name" name="first_name"
                        value={formData.first_name} onChange={handleInputChange}
                        placeholder="Juan Carlos"
                        autoComplete="given-name"
                      />
                      {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="last_name">Apellidos *</Label>
                      <Input
                        id="last_name" name="last_name"
                        value={formData.last_name} onChange={handleInputChange}
                        placeholder="Pérez Hernández"
                        autoComplete="family-name"
                      />
                      {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="document_type">Tipo Documento *</Label>
                      <Select
                        value={formData.document_type}
                        onValueChange={(v) => handleSelectChange('document_type', v as FormState['document_type'])}
                      >
                        <SelectTrigger id="document_type">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="PAS">Pasaporte</SelectItem>
                          <SelectItem value="PTP">PTP</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.document_type && <p className="text-xs text-red-500 mt-1">{errors.document_type}</p>}
                    </div>

                    <div>
                      <Label htmlFor="document_number">Número de Documento *</Label>
                      <Input
                        id="document_number" name="document_number"
                        value={formData.document_number} onChange={handleInputChange}
                        placeholder="12345678"
                      />
                      {errors.document_number && <p className="text-xs text-red-500 mt-1">{errors.document_number}</p>}
                    </div>

                    <div>
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                      <Input
                        id="fecha_nacimiento" name="fecha_nacimiento" type="date"
                        value={formData.fecha_nacimiento} onChange={handleInputChange}
                      />
                      {errors.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
                    </div>

                    <div>
                      <Label htmlFor="genero">Género</Label>
                      <Select
                        value={formData.genero}
                        onValueChange={(v) => handleSelectChange('genero', v as FormState['genero'])}
                      >
                        <SelectTrigger id="genero">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono" name="telefono" type="tel"
                        value={formData.telefono} onChange={handleInputChange}
                        placeholder="xxx-xxx-xxx"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datos Académicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="nivel">Nivel *</Label>
                      <Select
                        value={formData.nivel}
                        onValueChange={(v) => handleSelectChange('nivel', v as NivelValue)}
                      >
                        <SelectTrigger id="nivel">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primaria">Primaria</SelectItem>
                          <SelectItem value="secundaria">Secundaria</SelectItem>
                          <SelectItem value="preparatoria">Preparatoria</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.nivel && <p className="text-xs text-red-500 mt-1">{errors.nivel}</p>}
                    </div>

                    <div>
                      <Label htmlFor="grado">Grado *</Label>
                      <Select
                        value={formData.grado}
                        onValueChange={(v) => handleSelectChange('grado', v)}
                        disabled={!formData.nivel}
                      >
                        <SelectTrigger id="grado">
                          <SelectValue placeholder={formData.nivel ? 'Seleccionar' : 'Primero nivel'} />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.grado && <p className="text-xs text-red-500 mt-1">{errors.grado}</p>}
                    </div>

                    <div>
                      <Label htmlFor="grupo">Grupo</Label>
                      <Input
                        id="grupo" name="grupo"
                        value={formData.grupo} onChange={handleInputChange}
                        placeholder="A" className="uppercase" maxLength={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sede">Sede *</Label>
                      <Select
                        value={formData.sede}
                        onValueChange={(v) => handleSelectChange('sede', v as FormState['sede'])}
                      >
                        <SelectTrigger id="sede">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="central">Sede Central</SelectItem>
                          <SelectItem value="norte">Sede Norte</SelectItem>
                          <SelectItem value="sur">Sede Sur</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sede && <p className="text-xs text-red-500 mt-1">{errors.sede}</p>}
                    </div>

                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datos del Apoderado</CardTitle>
                  <CardDescription>Responsable legal del alumno</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="tutor_first_name">Nombres del Apoderado *</Label>
                        <Input
                          id="tutor_first_name" name="tutor_first_name"
                          value={formData.tutor_first_name} onChange={handleInputChange}
                          placeholder="María Elena"
                          autoComplete="given-name"
                        />
                        {errors.tutor_first_name && <p className="text-xs text-red-500 mt-1">{errors.tutor_first_name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="tutor_last_name">Apellidos del Apoderado *</Label>
                        <Input
                          id="tutor_last_name" name="tutor_last_name"
                          value={formData.tutor_last_name} onChange={handleInputChange}
                          placeholder="García López"
                          autoComplete="family-name"
                        />
                        {errors.tutor_last_name && <p className="text-xs text-red-500 mt-1">{errors.tutor_last_name}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="parentesco_tutor">Parentesco *</Label>
                      <Select
                        value={formData.parentesco_tutor}
                        onValueChange={(v) => handleSelectChange('parentesco_tutor', v as FormState['parentesco_tutor'])}
                      >
                        <SelectTrigger id="parentesco_tutor">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madre">Madre</SelectItem>
                          <SelectItem value="padre">Padre</SelectItem>
                          <SelectItem value="tutor">Tutor Legal</SelectItem>
                          <SelectItem value="abuelo">Abuelo/Abuela</SelectItem>
                          <SelectItem value="hermano">Hermano/Hermana</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.parentesco_tutor && <p className="text-xs text-red-500 mt-1">{errors.parentesco_tutor}</p>}
                    </div>

                    <div>
                      <Label htmlFor="telefono_tutor">Teléfono *</Label>
                      <Input
                        id="telefono_tutor" name="telefono_tutor" type="tel"
                        value={formData.telefono_tutor} onChange={handleInputChange}
                        placeholder="xxx-xxx-xxx"
                      />
                      {errors.telefono_tutor && <p className="text-xs text-red-500 mt-1">{errors.telefono_tutor}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 py-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Confirmar inscripción
                  </CardTitle>
                  <CardDescription>Revisa los datos antes de registrar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Alumno</p>
                    <p>{formData.last_name}, {formData.first_name}</p>
                    <p className="text-gray-500">
                      {formData.document_type} {formData.document_number} ·
                      {' '}Nace: {formData.fecha_nacimiento}
                      {formData.telefono && ` · Tel: ${formData.telefono}`}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Académico</p>
                    <p>
                      {formData.nivel} {formData.grado}
                      {formData.grupo && ` - Grupo ${formData.grupo.toUpperCase()}`}
                      {' · '}Sede {formData.sede}
                      {periodoActual && ` · ${periodoActual}`}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Apoderado</p>
                    <p>
                      {formData.tutor_last_name}, {formData.tutor_first_name} ({formData.parentesco_tutor}) · Tel: {formData.telefono_tutor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
            )}
            {step < 2 && (
              <Button type="button" onClick={handleNext} disabled={isLoading}>
                Revisar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Confirmar Inscripción'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
