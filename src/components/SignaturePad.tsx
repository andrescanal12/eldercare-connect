import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Check, Pen, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignaturePadProps {
  value: string;
  onChange: (signature: string) => void;
  error?: string;
}

export function SignaturePad({ value, onChange, error }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(!!value);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inicializar canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Estilo de línea — más gruesa para firmar mejor
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Línea guía para firmar
    const lineY = rect.height * 0.75;
    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(20, lineY);
    ctx.lineTo(rect.width - 20, lineY);
    ctx.stroke();
    ctx.restore();

    // Restaurar estilo de dibujo
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Si hay firma guardada, cargarla
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas, isFullscreen]);

  // Re-setup on resize
  useEffect(() => {
    const handleResize = () => {
      // Pequeño delay para que el DOM se actualice
      setTimeout(setupCanvas, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

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

    // Asegurar estilo de dibujo
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);

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

    // Redibujar línea guía
    const lineY = rect.height * 0.75;
    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(20, lineY);
    ctx.lineTo(rect.width - 20, lineY);
    ctx.stroke();
    ctx.restore();

    // Restaurar estilo de dibujo
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);

    setHasDrawn(false);
    setIsSaved(false);
    onChange('');
  }, [onChange]);

  // Guardar firma — auto-recorta al contenido real
  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Escanear píxeles para encontrar el bounding box de la firma
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    const bgR = 255, bgG = 255, bgB = 255; // fondo blanco
    const guideR = 209, guideG = 213, guideB = 219; // color de la línea guía #d1d5db
    const threshold = 30;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];

        // Ignorar píxeles blancos (fondo)
        const diffBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (diffBg < threshold) continue;

        // Ignorar píxeles similares a la línea guía
        const diffGuide = Math.abs(r - guideR) + Math.abs(g - guideG) + Math.abs(b - guideB);
        if (diffGuide < threshold) continue;

        // Es un píxel de tinta
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    // Si no se encontró firma, exportar todo
    if (minX > maxX || minY > maxY) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
      setIsSaved(true);
      return;
    }

    // Añadir padding alrededor de la firma
    const padding = Math.round(Math.max(maxX - minX, maxY - minY) * 0.15);
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(width - cropX, (maxX - minX) + padding * 2);
    const cropH = Math.min(height - cropY, (maxY - minY) + padding * 2);

    // Crear canvas temporal con la firma recortada
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = cropW;
    trimmedCanvas.height = cropH;
    const trimCtx = trimmedCanvas.getContext('2d');
    if (!trimCtx) return;

    // Fondo blanco
    trimCtx.fillStyle = '#FFFFFF';
    trimCtx.fillRect(0, 0, cropW, cropH);

    // Copiar solo la región de la firma
    trimCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const dataUrl = trimmedCanvas.toDataURL('image/png');
    onChange(dataUrl);
    setIsSaved(true);
  }, [hasDrawn, onChange]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Cerrar fullscreen con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Pen className="h-4 w-4" />
        Firma del beneficiario
        <span className="text-destructive">*</span>
      </Label>

      {/* Canvas de firma */}
      <div
        ref={containerRef}
        className={`${isFullscreen
          ? 'fixed inset-0 z-50 bg-white flex flex-col p-4'
          : 'relative'
          }`}
      >
        {/* Header en fullscreen */}
        {isFullscreen && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">✍️ Dibuje su firma</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
            >
              <Minimize2 className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
        )}

        <div
          className={`relative border-2 rounded-lg overflow-hidden transition-colors ${error ? 'border-destructive' : isSaved ? 'border-success' : 'border-border hover:border-primary/50'
            } ${isFullscreen ? 'flex-1' : ''}`}
        >
          <canvas
            ref={canvasRef}
            className={`w-full touch-none cursor-crosshair bg-white ${isFullscreen ? 'h-full' : 'h-48 sm:h-56 md:h-64'
              }`}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Pen className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-sm font-medium">
                Dibuje su firma aquí
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Use el dedo o el ratón
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
        <div className={`flex gap-2 ${isFullscreen ? 'mt-3' : 'mt-3'}`}>
          {!isFullscreen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
              title="Ampliar para firmar mejor"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
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
            onClick={() => {
              saveSignature();
              if (isFullscreen && hasDrawn) {
                setIsFullscreen(false);
              }
            }}
            disabled={!hasDrawn || isSaved}
            className="flex-1 gap-2 btn-primary"
          >
            <Check className="h-4 w-4" />
            Guardar firma
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && !isFullscreen && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {/* Preview mini */}
      {value && !isFullscreen && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
          <img
            src={value}
            alt="Firma guardada"
            className="h-16 border border-border rounded bg-card object-contain"
          />
        </div>
      )}
    </div>
  );
}
