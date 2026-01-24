import { useState } from 'react';
import { RefreshCw, Trash2, Eye, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BeneficiaryRecord } from '@/types/beneficiary';

interface LocalRecordsTableProps {
  records: BeneficiaryRecord[];
  onRetry: (record: BeneficiaryRecord) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export function LocalRecordsTable({ 
  records, 
  onRetry, 
  onDelete, 
  onExportCSV,
  isLoading 
}: LocalRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<BeneficiaryRecord | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: BeneficiaryRecord['status']) => {
    switch (status) {
      case 'sent':
        return <span className="badge-success">Enviado</span>;
      case 'pending':
        return <span className="badge-pending">Pendiente</span>;
      case 'error':
        return <span className="bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-full text-xs font-medium">Error</span>;
    }
  };

  // Mostrar solo los últimos 10
  const recentRecords = records.slice(0, 10);

  if (records.length === 0) {
    return (
      <div className="card-form p-6 text-center">
        <p className="text-muted-foreground">No hay registros locales</p>
      </div>
    );
  }

  return (
    <>
      <div className="card-form overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">
            Últimos registros ({records.length} total)
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.nombre_apellido}</TableCell>
                  <TableCell>{record.documento}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(record.createdAt)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRecord(record)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {record.status !== 'sent' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRetry(record)}
                          disabled={isLoading}
                          title="Reintentar envío"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(record.id)}
                        className="text-destructive hover:text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cards móvil */}
        <div className="md:hidden divide-y divide-border">
          {recentRecords.map((record) => (
            <div key={record.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{record.nombre_apellido}</p>
                  <p className="text-sm text-muted-foreground">{record.documento}</p>
                </div>
                {getStatusBadge(record.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(record.createdAt)}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecord(record)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                {record.status !== 'sent' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(record)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(record.id)}
                  className="text-destructive border-destructive/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal detalle */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del registro</DialogTitle>
            <DialogDescription>
              {selectedRecord?.nombre_apellido}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Sexo</p>
                  <p className="font-medium">{selectedRecord.sexo === 'H' ? 'Hombre' : 'Mujer'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Edad</p>
                  <p className="font-medium">{selectedRecord.edad} años</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selectedRecord.telefono}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Domicilio</p>
                  <p className="font-medium">{selectedRecord.domicilio}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Documento</p>
                  <p className="font-medium">{selectedRecord.documento}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-muted-foreground mb-2">Núcleo familiar</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p>Adulto H: <span className="font-medium">{selectedRecord.adulto_h}</span></p>
                  <p>Adulto M: <span className="font-medium">{selectedRecord.adulto_m}</span></p>
                  <p>Niño 0-5: <span className="font-medium">{selectedRecord.nino_0_5}</span></p>
                  <p>Niña 0-5: <span className="font-medium">{selectedRecord.nina_0_5}</span></p>
                  <p>Niño 6-18: <span className="font-medium">{selectedRecord.nino_6_18}</span></p>
                  <p>Niña 6-18: <span className="font-medium">{selectedRecord.nina_6_18}</span></p>
                  <p>&gt;60 Hom: <span className="font-medium">{selectedRecord.mayor_60_hom}</span></p>
                  <p>&gt;60 Muj: <span className="font-medium">{selectedRecord.mayor_60_muj}</span></p>
                  <p>PCD H: <span className="font-medium">{selectedRecord.pcd_h}</span></p>
                  <p>PCD M: <span className="font-medium">{selectedRecord.pcd_m}</span></p>
                </div>
              </div>

              {selectedRecord.firma_base64_png && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground mb-2">Firma</p>
                  <img 
                    src={selectedRecord.firma_base64_png} 
                    alt="Firma" 
                    className="h-20 border rounded bg-card"
                  />
                </div>
              )}

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  {getStatusBadge(selectedRecord.status)}
                </div>
                {selectedRecord.serverResponse && (
                  <div className="text-right">
                    <p className="text-muted-foreground">Respuesta</p>
                    <p className="text-xs">{selectedRecord.serverResponse}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
