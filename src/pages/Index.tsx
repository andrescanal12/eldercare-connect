import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EventBanner } from '@/components/EventBanner';
import { BeneficiaryForm } from '@/components/BeneficiaryForm';
import { SettingsModal } from '@/components/SettingsModal';
import { useLocalRecords } from '@/hooks/useLocalRecords';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    records,
    endpointUrl,
    eventInfo,
    isLoading,
    addRecord,
    setEndpointUrl,
    setEventInfo,
    sendToGoogleSheets,
    testConnection,
  } = useLocalRecords();

  // Scroll al formulario
  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Navegar a la página de registros
  const handleViewRecords = useCallback(() => {
    navigate('/registros');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onNewRecord={scrollToForm}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Banner del evento */}
      <EventBanner
        onViewRecords={handleViewRecords}
        recordCount={records.length}
        eventInfo={eventInfo}
      />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Formulario */}
        <div ref={formRef}>
          <BeneficiaryForm
            onSubmit={addRecord}
            onSendToSheets={sendToGoogleSheets}
            isLoading={isLoading}
            hasEndpoint={!!endpointUrl}
            eventInfo={eventInfo}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Fundación Internacional María Luisa de Moreno.
            Los datos recopilados se utilizan exclusivamente para la gestión del evento.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Protección de datos conforme al RGPD.
          </p>
        </div>
      </footer>

      {/* Modal de ajustes */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        endpointUrl={endpointUrl}
        onEndpointChange={setEndpointUrl}
        eventInfo={eventInfo}
        onEventInfoChange={setEventInfo}
        onTestConnection={testConnection}
      />
    </div>
  );
};


export default Index;
