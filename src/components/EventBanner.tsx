import { Calendar, MapPin, Gift, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventInfo } from '@/types/beneficiary';

interface EventBannerProps {
  onViewRecords: () => void;
  recordCount: number;
  eventInfo: EventInfo;
}

export function EventBanner({ onViewRecords, recordCount, eventInfo }: EventBannerProps) {
  return (
    <div className="mesh-gradient text-primary-foreground shadow-inner">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Título del evento */}
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-shadow-sm uppercase">
            {eventInfo.evento}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-0.5 w-8 bg-secondary rounded-full" />
            <p className="text-primary-foreground/90 text-xs sm:text-sm font-semibold tracking-widest uppercase">
              {eventInfo.registro}
            </p>
            <div className="h-0.5 w-8 bg-secondary rounded-full" />
          </div>
        </div>

        {/* Información del evento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-lg transition-transform hover:scale-[1.02]">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <span className="text-[10px] text-primary-foreground/60 uppercase font-bold tracking-wider block">Fecha</span>
              <span className="text-sm font-bold">{eventInfo.fecha_evento}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-lg transition-transform hover:scale-[1.02]">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <span className="text-[10px] text-primary-foreground/60 uppercase font-bold tracking-wider block">Ciudad</span>
              <span className="text-sm font-bold">{eventInfo.ciudad}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-lg transition-transform hover:scale-[1.02]">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <Gift className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <span className="text-[10px] text-primary-foreground/60 uppercase font-bold tracking-wider block">Beneficios</span>
              <span className="text-sm font-bold line-clamp-1">{eventInfo.beneficios_entregados}</span>
            </div>
          </div>
        </div>

        {/* Botón ver registros */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={onViewRecords}
            className="gap-2 bg-white text-primary border-none hover:bg-white/90 shadow-xl px-6 h-11 rounded-full font-bold group"
          >
            <ClipboardList className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            Ver registros ({recordCount})
          </Button>
        </div>
      </div>
    </div>
  );
}

