import { useState } from 'react';
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

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpointUrl: string;
  onEndpointChange: (url: string) => void;
  onTestConnection: () => Promise<{ success: boolean; message: string }>;
}

export function SettingsModal({
  open,
  onOpenChange,
  endpointUrl,
  onEndpointChange,
  onTestConnection,
}: SettingsModalProps) {
  const [url, setUrl] = useState(endpointUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    onEndpointChange(url);
    toast({
      title: 'Configuración guardada',
      description: 'La URL del endpoint ha sido actualizada.',
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
          <DialogDescription>
            Configure la conexión con Google Apps Script para enviar los registros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL del endpoint */}
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
              disabled={!url}
              className="flex-1 btn-primary"
            >
              Guardar URL
            </Button>
          </div>

          {/* Resultado del test */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                testResult.success
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
