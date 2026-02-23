import { useState, useEffect } from 'react';
import { Settings, ExternalLink, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { EventInfo } from '@/types/beneficiary';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpointUrl: string;
  onEndpointChange: (url: string) => void;
  eventInfo: EventInfo;
  onEventInfoChange: (info: EventInfo) => void;
  onTestConnection: () => Promise<{ success: boolean; message: string }>;
}

export function SettingsModal({
  open,
  onOpenChange,
  endpointUrl,
  onEndpointChange,
  eventInfo,
  onEventInfoChange,
  onTestConnection,
}: SettingsModalProps) {
  const [url, setUrl] = useState(endpointUrl);
  const [info, setInfo] = useState<EventInfo>(eventInfo);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Actualizar estado local cuando cambian las props
  useEffect(() => {
    setUrl(endpointUrl);
  }, [endpointUrl]);

  useEffect(() => {
    setInfo(eventInfo);
  }, [eventInfo]);

  const handleSave = () => {
    onEndpointChange(url);
    onEventInfoChange(info);
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes han sido actualizados correctamente.',
    });
  };

  const handleTest = async () => {
    if (!url) {
      setTestResult({ success: false, message: 'Ingrese una URL primero' });
      return;
    }

    // Guardar primero la URL
    onEndpointChange(url);

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Error al probar conexión' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
          <DialogDescription>
            Configure los detalles del evento y la conexión con Google Sheets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Detalles del Evento */}
          <div className="space-y-4 border-b border-border pb-6">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Detalles del Evento
            </h4>

            <div className="space-y-2">
              <Label htmlFor="event-name">Nombre del Evento</Label>
              <Input
                id="event-name"
                value={info.evento}
                onChange={(e) => setInfo(prev => ({ ...prev, evento: e.target.value }))}
                placeholder="Ej: DÍA DE LA MUJER - ESPAÑA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Fecha del Evento</Label>
              <Input
                id="event-date"
                value={info.fecha_evento}
                onChange={(e) => setInfo(prev => ({ ...prev, fecha_evento: e.target.value }))}
                placeholder="Ej: lunes 23 de febrero 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-benefits">Beneficios</Label>
              <Input
                id="event-benefits"
                value={info.beneficios_entregados}
                onChange={(e) => setInfo(prev => ({ ...prev, beneficios_entregados: e.target.value }))}
                placeholder="Ej: Sorpresas, Premios..."
              />
            </div>
          </div>

          {/* URL del endpoint */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Conexión
            </h4>

            <div className="space-y-2">
              <Label htmlFor="endpoint-url">
                Google Apps Script Web App URL
              </Label>
              <Input
                id="endpoint-url"
                type="url"
                placeholder="https://script.google.com/macros/s/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setTestResult(null);
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Esta URL se obtiene al publicar tu Google Apps Script como Web App.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !url}
              className="flex-1"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Probar conexión
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Guardar Cambios
            </Button>
          </div>

          {/* Resultado del test */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${testResult.success
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
                }`}
            >
              {testResult.success ? (
                <Check className="h-4 w-4 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 flex-shrink-0" />
              )}
              {testResult.message}
            </div>
          )}

          {/* Ayuda */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">¿Cómo obtener la URL?</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Abre tu proyecto de Google Apps Script</li>
              <li>Ve a "Implementar" → "Nueva implementación"</li>
              <li>Selecciona "Aplicación web"</li>
              <li>Configura acceso como "Cualquier usuario"</li>
              <li>Haz clic en "Implementar" y copia la URL</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

