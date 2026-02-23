import { useState, useCallback } from 'react';
import { Send, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FamilyCountsGrid } from './FamilyCountsGrid';
import { SignaturePad } from './SignaturePad';
import { EventInfo, FamilyCounts, BeneficiaryRecord } from '@/types/beneficiary';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  sexo: 'H' | 'M' | '';
  nombre_apellido: string;
  edad: string;
  telefono: string;
  domicilio: string;
  documento: string;
  firma_base64_png: string;
  familyCounts: FamilyCounts;
}

interface FormErrors {
  sexo?: string;
  nombre_apellido?: string;
  edad?: string;
  telefono?: string;
  domicilio?: string;
  documento?: string;
  firma_base64_png?: string;
}

const initialFamilyCounts: FamilyCounts = {
  adulto_h: 0,
  adulto_m: 0,
  nino_0_5: 0,
  nina_0_5: 0,
  nino_6_18: 0,
  nina_6_18: 0,
  mayor_60_hom: 0,
  mayor_60_muj: 0,
  pcd_h: 0,
  pcd_m: 0,
};

const initialFormData: FormData = {
  sexo: '',
  nombre_apellido: '',
  edad: '',
  telefono: '',
  domicilio: '',
  documento: '',
  firma_base64_png: '',
  familyCounts: initialFamilyCounts,
};

interface BeneficiaryFormProps {
  onSubmit: (record: Omit<BeneficiaryRecord, 'id' | 'createdAt'>) => BeneficiaryRecord;
  onSendToSheets: (record: BeneficiaryRecord) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  hasEndpoint: boolean;
  eventInfo: EventInfo;
}

export function BeneficiaryForm({
  onSubmit,
  onSendToSheets,
  isLoading,
  hasEndpoint,
  eventInfo
}: BeneficiaryFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Validar formulario
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sexo) {
      newErrors.sexo = 'Seleccione el sexo';
    }

    if (!formData.nombre_apellido.trim()) {
      newErrors.nombre_apellido = 'Ingrese nombre y apellido';
    }

    const edad = parseInt(formData.edad, 10);
    if (!formData.edad || isNaN(edad) || edad < 0 || edad > 120) {
      newErrors.edad = 'Ingrese una edad válida (0-120)';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Ingrese el teléfono';
    }

    if (!formData.domicilio.trim()) {
      newErrors.domicilio = 'Ingrese el domicilio';
    }

    if (!formData.documento.trim()) {
      newErrors.documento = 'Ingrese DNI, NIE o Pasaporte';
    }

    if (!formData.firma_base64_png) {
      newErrors.firma_base64_png = 'La firma es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Crear registro
  const createRecord = useCallback((): Omit<BeneficiaryRecord, 'id' | 'createdAt'> => {
    return {
      ...eventInfo,
      timestamp_envio: new Date().toISOString(),
      sexo: formData.sexo as 'H' | 'M',
      nombre_apellido: formData.nombre_apellido.trim(),
      edad: parseInt(formData.edad, 10),
      telefono: formData.telefono.trim(),
      domicilio: formData.domicilio.trim(),
      documento: formData.documento.trim(),
      firma_base64_png: formData.firma_base64_png,
      ...formData.familyCounts,
      status: 'pending',
    };
  }, [formData, eventInfo]);


  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  // Guardar sin enviar
  const handleSaveLocal = useCallback(() => {
    if (!validate()) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Complete todos los campos obligatorios.',
      });
      return;
    }

    const record = createRecord();
    onSubmit(record);
    resetForm();

    toast({
      title: 'Registro guardado',
      description: 'El registro se ha guardado localmente.',
    });
  }, [validate, createRecord, onSubmit, resetForm, toast]);

  // Enviar a Google Sheets
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Complete todos los campos obligatorios.',
      });
      return;
    }

    if (!hasEndpoint) {
      toast({
        variant: 'destructive',
        title: 'Sin configurar',
        description: 'Configure la URL del endpoint en Ajustes.',
      });
      return;
    }

    setIsSending(true);

    // Primero guardar localmente
    const record = createRecord();
    const savedRecord = onSubmit(record);

    // Luego intentar enviar
    const result = await onSendToSheets(savedRecord);

    setIsSending(false);

    if (result.success) {
      toast({
        title: '¡Registro enviado!',
        description: 'El beneficiario ha sido registrado correctamente.',
      });
      resetForm();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: `${result.message}. El registro se guardó localmente.`,
      });
    }
  }, [validate, hasEndpoint, createRecord, onSubmit, onSendToSheets, resetForm, toast]);

  // Actualizar family counts
  const handleFamilyCountChange = useCallback((field: keyof FamilyCounts, value: number) => {
    setFormData(prev => ({
      ...prev,
      familyCounts: {
        ...prev.familyCounts,
        [field]: value
      }
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="card-form overflow-hidden">
      {/* Encabezado del Formulario */}
      <div className="bg-primary/5 border-b border-border p-4 sm:p-6">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Registro de Beneficiario
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Complete todos los campos marcados con asterisco (*)
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-8">
        {/* Datos personales */}
        <div>
          <h3 className="section-title text-primary border-primary/20">
            1. Datos Personales
          </h3>

          <div className="space-y-4">
            {/* Sexo */}
            <div className="space-y-2">
              <Label>
                Sexo <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.sexo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value as 'H' | 'M' }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="H" id="sexo-h" />
                  <Label htmlFor="sexo-h" className="font-normal cursor-pointer">
                    Hombre (H)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="sexo-m" />
                  <Label htmlFor="sexo-m" className="font-normal cursor-pointer">
                    Mujer (M)
                  </Label>
                </div>
              </RadioGroup>
              {errors.sexo && <p className="text-destructive text-sm">{errors.sexo}</p>}
            </div>

            {/* Nombre y apellido */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre y Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre_apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_apellido: e.target.value }))}
                placeholder="Ej: María García López"
                className={errors.nombre_apellido ? 'border-destructive' : ''}
              />
              {errors.nombre_apellido && <p className="text-destructive text-sm">{errors.nombre_apellido}</p>}
            </div>

            {/* Edad y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">
                  Edad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edad"
                  type="number"
                  min={0}
                  max={120}
                  value={formData.edad}
                  onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
                  placeholder="Ej: 72"
                  className={errors.edad ? 'border-destructive' : ''}
                />
                {errors.edad && <p className="text-destructive text-sm">{errors.edad}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +34 612 345 678"
                  className={errors.telefono ? 'border-destructive' : ''}
                />
                {errors.telefono && <p className="text-destructive text-sm">{errors.telefono}</p>}
              </div>
            </div>

            {/* Domicilio */}
            <div className="space-y-2">
              <Label htmlFor="domicilio">
                Domicilio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="domicilio"
                value={formData.domicilio}
                onChange={(e) => setFormData(prev => ({ ...prev, domicilio: e.target.value }))}
                placeholder="Ej: Calle Mayor 123, 2º B, Sabadell"
                className={errors.domicilio ? 'border-destructive' : ''}
              />
              {errors.domicilio && <p className="text-destructive text-sm">{errors.domicilio}</p>}
            </div>
          </div>
        </div>

        {/* Núcleo familiar */}
        <div>
          <h3 className="section-title text-primary border-primary/20">
            2. Núcleo Familiar (Cantidades)
          </h3>
          <FamilyCountsGrid
            values={formData.familyCounts}
            onChange={handleFamilyCountChange}
          />
        </div>

        {/* Identificación */}
        <div>
          <h3 className="section-title text-primary border-primary/20">
            3. Identificación
          </h3>
          <div className="space-y-2">
            <Label htmlFor="documento">
              DNI, NIE o Pasaporte <span className="text-destructive">*</span>
            </Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
              placeholder="Ej: 12345678A"
              className={errors.documento ? 'border-destructive' : ''}
            />
            {errors.documento && <p className="text-destructive text-sm">{errors.documento}</p>}
          </div>
        </div>

        {/* Firma */}
        <div>
          <h3 className="section-title text-primary border-primary/20">
            4. Firma
          </h3>
          <SignaturePad
            value={formData.firma_base64_png}
            onChange={(signature) => setFormData(prev => ({ ...prev, firma_base64_png: signature }))}
            error={errors.firma_base64_png}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isLoading || isSending || !hasEndpoint}
            className="btn-primary flex-1 gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar a Google Sheets
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleSaveLocal}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar sin enviar
          </Button>
        </div>

        {!hasEndpoint && (
          <p className="text-center text-sm text-muted-foreground">
            ⚙️ Configure la URL del endpoint en Ajustes para poder enviar registros.
          </p>
        )}
      </div>
    </form>
  );
}
