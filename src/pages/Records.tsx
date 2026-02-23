import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalRecordsTable } from '@/components/LocalRecordsTable';
import { SettingsModal } from '@/components/SettingsModal';
import { useLocalRecords } from '@/hooks/useLocalRecords';
import { useToast } from '@/hooks/use-toast';
import logoFimlm from '@/assets/logo-fimlm.png';

const Records = () => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { toast } = useToast();

    const {
        records,
        endpointUrl,
        eventInfo,
        isLoading,
        deleteRecord,
        setEndpointUrl,
        setEventInfo,
        sendToGoogleSheets,
        testConnection,
        exportToCSV,
    } = useLocalRecords();

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

    const handleDelete = useCallback((id: string) => {
        const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.');
        if (!confirmed) return;

        deleteRecord(id);
        toast({
            title: 'Registro eliminado',
            description: 'El registro ha sido eliminado.',
        });
    }, [deleteRecord, toast]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/')}
                                aria-label="Volver"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <img
                                src={logoFimlm}
                                alt="Logo FIMLM"
                                className="h-10 w-10 object-contain"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-primary">Registros</h1>
                                <p className="text-xs text-muted-foreground">{records.length} beneficiarios registrados</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-muted-foreground hover:text-primary"
                            aria-label="Configuración"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <main className="container mx-auto px-4 py-6">
                <LocalRecordsTable
                    records={records}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                    onExportCSV={exportToCSV}
                    isLoading={isLoading}
                />
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-8">
                <div className="container mx-auto px-4 py-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        © 2026 Fundación Internacional María Luisa de Moreno.
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

export default Records;
