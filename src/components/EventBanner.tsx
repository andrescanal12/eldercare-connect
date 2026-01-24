import { Calendar, MapPin, Gift, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EVENT_INFO } from '@/types/beneficiary';

interface EventBannerProps {
  onViewRecords: () => void;
  recordCount: number;
}

export function EventBanner({ onViewRecords, recordCount }: EventBannerProps) {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-4">
        {/* Título del evento */}
        <div className="text-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold tracking-wide">
            {EVENT_INFO.evento}
          </h3>
          <p className="text-primary-foreground/80 text-sm mt-1">
            {EVENT_INFO.registro}
          </p>
        </div>

        {/* Información del evento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-primary-dark/30 rounded-lg px-3 py-2">
            <Calendar className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="text-xs text-primary-foreground/70 block">Fecha</span>
              <span className="text-sm font-medium">{EVENT_INFO.fecha_evento}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-primary-dark/30 rounded-lg px-3 py-2">
            <MapPin className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="text-xs text-primary-foreground/70 block">Ciudad</span>
              <span className="text-sm font-medium">{EVENT_INFO.ciudad}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-primary-dark/30 rounded-lg px-3 py-2">
            <Gift className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="text-xs text-primary-foreground/70 block">Beneficios</span>
              <span className="text-sm font-medium line-clamp-2">{EVENT_INFO.beneficios_entregados}</span>
            </div>
          </div>
        </div>

        {/* Botón ver registros */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={onViewRecords}
            className="gap-2 bg-card text-primary hover:bg-card/90"
          >
            <ClipboardList className="h-4 w-4" />
            Ver registros ({recordCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
