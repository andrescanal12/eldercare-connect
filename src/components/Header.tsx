import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoFimlm from '@/assets/logo-fimlm.png';

interface HeaderProps {
  onNewRecord: () => void;
  onOpenSettings: () => void;
}

export function Header({ onNewRecord, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <img 
              src={logoFimlm} 
              alt="Logo FIMLM" 
              className="h-12 w-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary">FIMLM</h1>
              <p className="text-xs text-muted-foreground">Fundación Internacional María Luisa de Moreno</p>
            </div>
          </div>

          {/* Título central */}
          <div className="hidden md:block text-center">
            <h2 className="text-xl font-semibold text-foreground">Registro de Beneficiarios</h2>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="text-muted-foreground hover:text-primary"
              aria-label="Configuración"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              onClick={onNewRecord}
              className="btn-primary gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo registro</span>
            </Button>
          </div>
        </div>

        {/* Título móvil */}
        <div className="md:hidden mt-2 text-center">
          <h2 className="text-lg font-semibold text-foreground">Registro de Beneficiarios</h2>
        </div>
      </div>
    </header>
  );
}
