import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoFimlm from '@/assets/logo-fimlm.png';

interface HeaderProps {
  onNewRecord: () => void;
  onOpenSettings: () => void;
}

export function Header({ onNewRecord, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-header shadow-sm">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo y nombre */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={logoFimlm}
              alt="Logo FIMLM"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
            <div className="hidden xs:block sm:block">
              <h1 className="text-sm sm:text-lg font-bold text-primary leading-tight">FIMLM</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-none">Fundación Internacional María Luisa de Moreno</p>
            </div>
          </div>

          {/* Título central - solo visible en pantallas grandes para evitar saturación */}
          <div className="hidden md:block text-center flex-1">
            <h2 className="text-xl font-semibold text-foreground">Registro de Beneficiarios</h2>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="text-muted-foreground hover:text-primary h-9 w-9"
              aria-label="Configuración"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              onClick={onNewRecord}
              className="btn-primary gap-2 h-9 sm:h-10 px-3 sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo registro</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
