import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Check, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignaturePadProps {
  value: string;
  onChange: (signature: string) => void;
  error?: string;
}

export function SignaturePad({ value, onChange, error }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(!!value);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Establecer tamaño real del canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Estilo de línea
    ctx.strokeStyle = '#0B5FA5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Si hay firma guardada, cargarla
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, []);

  // Obtener posición del cursor/touch
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Iniciar dibujo
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
    setIsSaved(false);
  }, [getPosition]);

  // Dibujar
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPosition]);

  // Terminar dibujo
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Limpiar firma
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setIsSaved(false);
    onChange('');
  }, [onChange]);

  // Guardar firma
  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    setIsSaved(true);
  }, [hasDrawn, onChange]);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Pen className="h-4 w-4" />
        Firma del beneficiario
        <span className="text-destructive">*</span>
      </Label>

      {/* Canvas de firma */}
      <div 
        className={`relative border-2 rounded-lg overflow-hidden transition-colors ${
          error ? 'border-destructive' : isSaved ? 'border-success' : 'border-border'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-32 sm:h-40 touch-none cursor-crosshair bg-card"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* Placeholder */}
        {!hasDrawn && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">
              Dibuje su firma aquí
            </p>
          </div>
        )}

        {/* Indicador de guardado */}
        {isSaved && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" />
            Guardada
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          className="flex-1 gap-2"
        >
          <Eraser className="h-4 w-4" />
          Limpiar
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={saveSignature}
          disabled={!hasDrawn || isSaved}
          className="flex-1 gap-2 btn-primary"
        >
          <Check className="h-4 w-4" />
          Guardar firma
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {/* Preview mini */}
      {value && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
          <img 
            src={value} 
            alt="Firma guardada" 
            className="h-16 border border-border rounded bg-card"
          />
        </div>
      )}
    </div>
  );
}
