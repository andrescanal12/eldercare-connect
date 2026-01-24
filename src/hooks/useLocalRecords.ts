import { useState, useEffect, useCallback } from 'react';
import { BeneficiaryRecord } from '@/types/beneficiary';

const STORAGE_KEY = 'fimlm_beneficiary_records';
const ENDPOINT_KEY = 'fimlm_endpoint_url';

export function useLocalRecords() {
  const [records, setRecords] = useState<BeneficiaryRecord[]>([]);
  const [endpointUrl, setEndpointUrlState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar registros del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored records:', e);
      }
    }
    
    const storedEndpoint = localStorage.getItem(ENDPOINT_KEY);
    if (storedEndpoint) {
      setEndpointUrlState(storedEndpoint);
    }
  }, []);

  // Guardar registros en localStorage
  const saveRecords = useCallback((newRecords: BeneficiaryRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    setRecords(newRecords);
  }, []);

  // Añadir nuevo registro
  const addRecord = useCallback((record: Omit<BeneficiaryRecord, 'id' | 'createdAt'>) => {
    const newRecord: BeneficiaryRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const newRecords = [newRecord, ...records];
    saveRecords(newRecords);
    return newRecord;
  }, [records, saveRecords]);

  // Actualizar estado de un registro
  const updateRecordStatus = useCallback((id: string, status: BeneficiaryRecord['status'], serverResponse?: string) => {
    const newRecords = records.map(r => 
      r.id === id ? { ...r, status, serverResponse } : r
    );
    saveRecords(newRecords);
  }, [records, saveRecords]);

  // Eliminar registro
  const deleteRecord = useCallback((id: string) => {
    const newRecords = records.filter(r => r.id !== id);
    saveRecords(newRecords);
  }, [records, saveRecords]);

  // Configurar endpoint URL
  const setEndpointUrl = useCallback((url: string) => {
    localStorage.setItem(ENDPOINT_KEY, url);
    setEndpointUrlState(url);
  }, []);

  // Enviar registro a Google Sheets
  const sendToGoogleSheets = useCallback(async (record: BeneficiaryRecord): Promise<{ success: boolean; message: string }> => {
    if (!endpointUrl) {
      return { success: false, message: 'No se ha configurado la URL del endpoint' };
    }

    setIsLoading(true);

    // Preparar payload (sin campos locales)
    const payload = {
      evento: record.evento,
      registro: record.registro,
      fecha_evento: record.fecha_evento,
      ciudad: record.ciudad,
      beneficios_entregados: record.beneficios_entregados,
      timestamp_envio: new Date().toISOString(),
      sexo: record.sexo,
      nombre_apellido: record.nombre_apellido,
      edad: record.edad,
      telefono: record.telefono,
      domicilio: record.domicilio,
      adulto_h: record.adulto_h,
      adulto_m: record.adulto_m,
      nino_0_5: record.nino_0_5,
      nina_0_5: record.nina_0_5,
      nino_6_18: record.nino_6_18,
      nina_6_18: record.nina_6_18,
      mayor_60_hom: record.mayor_60_hom,
      mayor_60_muj: record.mayor_60_muj,
      pcd_h: record.pcd_h,
      pcd_m: record.pcd_m,
      documento: record.documento,
      firma_base64_png: record.firma_base64_png,
    };

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Apps Script requiere no-cors
        body: JSON.stringify(payload),
      });

      // Con no-cors no podemos leer la respuesta, asumimos éxito
      updateRecordStatus(record.id, 'sent', 'Enviado correctamente');
      setIsLoading(false);
      return { success: true, message: 'Registro enviado correctamente' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateRecordStatus(record.id, 'error', errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, [endpointUrl, updateRecordStatus]);

  // Probar conexión
  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!endpointUrl) {
      return { success: false, message: 'No se ha configurado la URL del endpoint' };
    }

    try {
      await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });
      return { success: true, message: 'Conexión establecida (modo no-cors)' };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }, [endpointUrl]);

  // Exportar a CSV
  const exportToCSV = useCallback(() => {
    if (records.length === 0) return;

    const headers = [
      'ID', 'Fecha Registro', 'Estado', 'Sexo', 'Nombre', 'Edad', 'Teléfono', 
      'Domicilio', 'Documento', 'Adulto H', 'Adulto M', 'Niño 0-5', 'Niña 0-5',
      'Niño 6-18', 'Niña 6-18', '>60 Hom', '>60 Muj', 'PCD H', 'PCD M'
    ];

    const rows = records.map(r => [
      r.id,
      new Date(r.createdAt).toLocaleString('es-ES'),
      r.status === 'sent' ? 'Enviado' : r.status === 'pending' ? 'Pendiente' : 'Error',
      r.sexo,
      r.nombre_apellido,
      r.edad,
      r.telefono,
      r.domicilio,
      r.documento,
      r.adulto_h,
      r.adulto_m,
      r.nino_0_5,
      r.nina_0_5,
      r.nino_6_18,
      r.nina_6_18,
      r.mayor_60_hom,
      r.mayor_60_muj,
      r.pcd_h,
      r.pcd_m
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registros_fimlm_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [records]);

  return {
    records,
    endpointUrl,
    isLoading,
    addRecord,
    updateRecordStatus,
    deleteRecord,
    setEndpointUrl,
    sendToGoogleSheets,
    testConnection,
    exportToCSV,
  };
}
