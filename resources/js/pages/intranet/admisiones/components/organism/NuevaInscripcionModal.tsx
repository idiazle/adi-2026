import { useState } from 'react';
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
import { UserPlus } from 'lucide-react';

interface NuevaInscripcionModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function NuevaInscripcionModal({ trigger, onSuccess }: NuevaInscripcionModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Alumno
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    nivel: '',
    grado: '',
    grupo: '',
    // Apoderado
    nombre_tutor: '',
    telefono_tutor: '',
    parentesco_tutor: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Inscripción creada:', formData);
      setIsLoading(false);
      setOpen(false);
      setFormData({
        nombre_completo: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        genero: '',
        nivel: '',
        grado: '',
        grupo: '',
        nombre_tutor: '',
        telefono_tutor: '',
        parentesco_tutor: '',
      });
      onSuccess?.();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

          <div className="grid gap-4 py-2">
            {/* Datos Personales del Alumno */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del Alumno</CardTitle>
                <CardDescription>Información personal y de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                    <Input
                      id="nombre_completo"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange}
                      placeholder="Juan Pérez Hernández"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="xxx-xxx-xxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                    <Input
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="genero">Género</Label>
                    <Select
                      value={formData.genero}
                      onValueChange={(value) => handleSelectChange('genero', value)}
                    >
                      <SelectTrigger id="genero">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos Académicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos Académicos</CardTitle>
                <CardDescription>Nivel y grupo del alumno</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="nivel">Nivel *</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value) => handleSelectChange('nivel', value)}
                      required
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
                  </div>

                  <div>
                    <Label htmlFor="grado">Grado *</Label>
                    <Select
                      value={formData.grado}
                      onValueChange={(value) => handleSelectChange('grado', value)}
                      required
                    >
                      <SelectTrigger id="grado">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ro">1ro</SelectItem>
                        <SelectItem value="2do">2do</SelectItem>
                        <SelectItem value="3ro">3ro</SelectItem>
                        <SelectItem value="4to">4to</SelectItem>
                        <SelectItem value="5to">5to</SelectItem>
                        <SelectItem value="6to">6to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="grupo">Grupo</Label>
                    <Input
                      id="grupo"
                      name="grupo"
                      value={formData.grupo}
                      onChange={handleInputChange}
                      placeholder="A"
                      className="uppercase"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del Apoderado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del Apoderado</CardTitle>
                <CardDescription>
                  Responsable legal del alumno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="nombre_tutor">Nombre Completo del Apoderado *</Label>
                    <Input
                      id="nombre_tutor"
                      name="nombre_tutor"
                      value={formData.nombre_tutor}
                      onChange={handleInputChange}
                      placeholder="María García López"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono_tutor">Teléfono del Apoderado *</Label>
                    <Input
                      id="telefono_tutor"
                      name="telefono_tutor"
                      type="tel"
                      value={formData.telefono_tutor}
                      onChange={handleInputChange}
                      placeholder="xxx-xxx-xxx"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentesco_tutor">Parentesco *</Label>
                    <Select
                      value={formData.parentesco_tutor}
                      onValueChange={(value) => handleSelectChange('parentesco_tutor', value)}
                      required
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Registrar Alumno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
