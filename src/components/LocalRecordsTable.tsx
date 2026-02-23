import { useState, useMemo } from 'react';
import { RefreshCw, Trash2, Eye, Send, Download, Search, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

type StatusFilter = 'all' | 'sent' | 'pending' | 'error';
type SexFilter = 'all' | 'H' | 'M';
type FamilyKey = 'adulto_h' | 'adulto_m' | 'nino_0_5' | 'nina_0_5' | 'nino_6_18' | 'nina_6_18' | 'mayor_60_hom' | 'mayor_60_muj' | 'pcd_h' | 'pcd_m';

export function LocalRecordsTable({
  records,
  onRetry,
  onDelete,
  onExportCSV,
  isLoading
}: LocalRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<BeneficiaryRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sexFilter, setSexFilter] = useState<SexFilter>('all');
  const [familyFilters, setFamilyFilters] = useState<Set<FamilyKey>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

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

  // Contadores para los chips
  const statusCounts = useMemo(() => ({
    all: records.length,
    sent: records.filter(r => r.status === 'sent').length,
    pending: records.filter(r => r.status === 'pending').length,
    error: records.filter(r => r.status === 'error').length,
  }), [records]);

  const sexCounts = useMemo(() => ({
    all: records.length,
    H: records.filter(r => r.sexo === 'H').length,
    M: records.filter(r => r.sexo === 'M').length,
  }), [records]);

  const familyCounts = useMemo(() => {
    const keys: FamilyKey[] = ['adulto_h', 'adulto_m', 'nino_0_5', 'nina_0_5', 'nino_6_18', 'nina_6_18', 'mayor_60_hom', 'mayor_60_muj', 'pcd_h', 'pcd_m'];
    const counts: Record<string, number> = {};
    for (const key of keys) {
      counts[key] = records.filter(r => (r[key] || 0) > 0).length;
    }
    return counts;
  }, [records]);

  const toggleFamilyFilter = (key: FamilyKey) => {
    setFamilyFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const hasActiveFilters = statusFilter !== 'all' || sexFilter !== 'all' || familyFilters.size > 0 || searchQuery.trim() !== '';

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Filtro de estado
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;

      // Filtro de sexo
      if (sexFilter !== 'all' && record.sexo !== sexFilter) return false;

      // Filtro de núcleo familiar (todos los seleccionados deben tener valor > 0)
      for (const key of familyFilters) {
        if ((record[key] || 0) === 0) return false;
      }

      // Búsqueda de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchableFields = [
          record.nombre_apellido,
          record.documento,
          record.telefono,
          record.domicilio,
          record.edad?.toString(),
          record.evento,
          record.ciudad,
          formatDate(record.createdAt),
        ];
        if (!searchableFields.some(field => field?.toLowerCase().includes(query))) {
          return false;
        }
      }

      return true;
    });
  }, [records, searchQuery, statusFilter, sexFilter, familyFilters]);

  const displayRecords = filteredRecords.slice(0, 20);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSexFilter('all');
    setFamilyFilters(new Set());
  };

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
        <div className="p-4 border-b border-border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {hasActiveFilters
                ? `${filteredRecords.length} de ${records.length} registros`
                : `${records.length} registros`
              }
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {(statusFilter !== 'all' ? 1 : 0) + (sexFilter !== 'all' ? 1 : 0) + familyFilters.size + (searchQuery ? 1 : 0)}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
              {/* Buscador */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">🔍 Buscar</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, documento, teléfono, dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtros por estado */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">📊 Estado</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={statusFilter === 'all'}
                    onClick={() => setStatusFilter('all')}
                    count={statusCounts.all}
                    color="default"
                  >
                    Todos
                  </FilterChip>
                  <FilterChip
                    active={statusFilter === 'sent'}
                    onClick={() => setStatusFilter('sent')}
                    count={statusCounts.sent}
                    color="green"
                  >
                    ✅ Enviados
                  </FilterChip>
                  <FilterChip
                    active={statusFilter === 'pending'}
                    onClick={() => setStatusFilter('pending')}
                    count={statusCounts.pending}
                    color="yellow"
                  >
                    ⏳ Pendientes
                  </FilterChip>
                  <FilterChip
                    active={statusFilter === 'error'}
                    onClick={() => setStatusFilter('error')}
                    count={statusCounts.error}
                    color="red"
                  >
                    ❌ Con error
                  </FilterChip>
                </div>
              </div>

              {/* Filtros por sexo */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">👤 Sexo</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={sexFilter === 'all'}
                    onClick={() => setSexFilter('all')}
                    count={sexCounts.all}
                    color="default"
                  >
                    Todos
                  </FilterChip>
                  <FilterChip
                    active={sexFilter === 'H'}
                    onClick={() => setSexFilter('H')}
                    count={sexCounts.H}
                    color="blue"
                  >
                    👨 Hombres
                  </FilterChip>
                  <FilterChip
                    active={sexFilter === 'M'}
                    onClick={() => setSexFilter('M')}
                    count={sexCounts.M}
                    color="pink"
                  >
                    👩 Mujeres
                  </FilterChip>
                </div>
              </div>

              {/* Filtros por núcleo familiar */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">👨‍👩‍👧‍👦 Núcleo familiar <span className="text-[10px] opacity-60">(puedes seleccionar varios)</span></p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={familyFilters.has('adulto_h')}
                    onClick={() => toggleFamilyFilter('adulto_h')}
                    count={familyCounts.adulto_h}
                    color="blue"
                  >
                    👨 Adulto H
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('adulto_m')}
                    onClick={() => toggleFamilyFilter('adulto_m')}
                    count={familyCounts.adulto_m}
                    color="pink"
                  >
                    👩 Adulto M
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('nino_0_5')}
                    onClick={() => toggleFamilyFilter('nino_0_5')}
                    count={familyCounts.nino_0_5}
                    color="green"
                  >
                    👦 Niño 0-5
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('nina_0_5')}
                    onClick={() => toggleFamilyFilter('nina_0_5')}
                    count={familyCounts.nina_0_5}
                    color="green"
                  >
                    👧 Niña 0-5
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('nino_6_18')}
                    onClick={() => toggleFamilyFilter('nino_6_18')}
                    count={familyCounts.nino_6_18}
                    color="yellow"
                  >
                    👦 Niño 6-18
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('nina_6_18')}
                    onClick={() => toggleFamilyFilter('nina_6_18')}
                    count={familyCounts.nina_6_18}
                    color="yellow"
                  >
                    👧 Niña 6-18
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('mayor_60_hom')}
                    onClick={() => toggleFamilyFilter('mayor_60_hom')}
                    count={familyCounts.mayor_60_hom}
                    color="blue"
                  >
                    🧓 &gt;60 Hom
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('mayor_60_muj')}
                    onClick={() => toggleFamilyFilter('mayor_60_muj')}
                    count={familyCounts.mayor_60_muj}
                    color="pink"
                  >
                    👵 &gt;60 Muj
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('pcd_h')}
                    onClick={() => toggleFamilyFilter('pcd_h')}
                    count={familyCounts.pcd_h}
                    color="blue"
                  >
                    ♿ PCD H
                  </FilterChip>
                  <FilterChip
                    active={familyFilters.has('pcd_m')}
                    onClick={() => toggleFamilyFilter('pcd_m')}
                    count={familyCounts.pcd_m}
                    color="pink"
                  >
                    ♿ PCD M
                  </FilterChip>
                </div>
              </div>

              {/* Limpiar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sin resultados */}
        {filteredRecords.length === 0 && hasActiveFilters && (
          <div className="p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground">No se encontraron registros con estos filtros</p>
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline mt-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Tabla desktop */}
        {displayRecords.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.nombre_apellido}</TableCell>
                    <TableCell>{record.documento}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{record.telefono}</TableCell>
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
        )}

        {/* Cards móvil */}
        {displayRecords.length > 0 && (
          <div className="md:hidden divide-y divide-border">
            {displayRecords.map((record) => (
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
        )}

        {/* Indicador de más registros */}
        {filteredRecords.length > 20 && (
          <div className="p-3 text-center border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Mostrando 20 de {filteredRecords.length} registros. Usa los filtros para afinar la búsqueda.
            </p>
          </div>
        )}
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
                    className="max-h-40 w-full border rounded bg-white p-2 object-contain"
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

// ========== Componente FilterChip ==========
interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  count: number;
  color: 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'pink';
  children: React.ReactNode;
}

function FilterChip({ active, onClick, count, color, children }: FilterChipProps) {
  const colorClasses = {
    default: active
      ? 'bg-primary text-primary-foreground shadow-md'
      : 'bg-muted/60 text-muted-foreground hover:bg-muted',
    green: active
      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
    yellow: active
      ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
    red: active
      ? 'bg-red-500 text-white shadow-md shadow-red-200'
      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
    blue: active
      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
    pink: active
      ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        transition-all duration-200 cursor-pointer select-none
        ${active ? 'scale-105' : 'hover:scale-[1.02]'}
        ${colorClasses[color]}
      `}
    >
      {children}
      <span className={`
        text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center
        ${active ? 'bg-white/25' : 'bg-black/5'}
      `}>
        {count}
      </span>
    </button>
  );
}
