import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { EventBanner } from '@/components/EventBanner';
import { BeneficiaryForm } from '@/components/BeneficiaryForm';
import { LocalRecordsTable } from '@/components/LocalRecordsTable';
import { SettingsModal } from '@/components/SettingsModal';
import { useLocalRecords } from '@/hooks/useLocalRecords';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    records,
    endpointUrl,
    isLoading,
    addRecord,
    deleteRecord,
    setEndpointUrl,
    sendToGoogleSheets,
    testConnection,
    exportToCSV,
  } = useLocalRecords();

  // Scroll al formulario
  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Ver registros (scroll a tabla)
  const handleViewRecords = useCallback(() => {
    const table = document.getElementById('records-table');
    table?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Reintentar envío
  const handleRetry = useCallback(async (record: any) => {
    const result = await sendToGoogleSheets(record);
    if (result.success) {
      toast({
        title: 'Registro enviado',
        description: 'El reintento fue exitoso.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  }, [sendToGoogleSheets, toast]);

  // Eliminar registro
  const handleDelete = useCallback((id: string) => {
    deleteRecord(id);
    toast({
      title: 'Registro eliminado',
      description: 'El registro ha sido eliminado.',
    });
  }, [deleteRecord, toast]);

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
      />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Formulario */}
        <div ref={formRef}>
          <BeneficiaryForm
            onSubmit={addRecord}
            onSendToSheets={sendToGoogleSheets}
            isLoading={isLoading}
            hasEndpoint={!!endpointUrl}
          />
        </div>

        {/* Tabla de registros */}
        <div id="records-table">
          <LocalRecordsTable
            records={records}
            onRetry={handleRetry}
            onDelete={handleDelete}
            onExportCSV={exportToCSV}
            isLoading={isLoading}
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
        onTestConnection={testConnection}
      />
    </div>
  );
};

export default Index;
