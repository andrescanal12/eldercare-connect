import { useState, useEffect, useCallback, useRef } from 'react';
import { BeneficiaryRecord } from '@/types/beneficiary';

const STORAGE_KEY = 'fimlm_beneficiary_records';
const ENDPOINT_KEY = 'fimlm_endpoint_url';

const EVENT_INFO_KEY = 'fimlm_event_info';

import { EVENT_INFO as DEFAULT_EVENT_INFO, EventInfo } from '@/types/beneficiary';

export function useLocalRecords() {
  const [records, setRecords] = useState<BeneficiaryRecord[]>([]);
  const [endpointUrl, setEndpointUrlState] = useState<string>('https://primary-production-7d4ca.up.railway.app/webhook/b91c9c3b-431f-4b80-ab39-c6360725f8f2');
  const [eventInfo, setEventInfoState] = useState<EventInfo>(DEFAULT_EVENT_INFO);
  const [isLoading, setIsLoading] = useState(false);

  // Ref para tener siempre los records actualizados (evita stale closures)
  const recordsRef = useRef<BeneficiaryRecord[]>([]);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  // Cargar datos del localStorage
  useEffect(() => {
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    if (storedRecords) {
      try {
        const parsed = JSON.parse(storedRecords);
        setRecords(parsed);
        recordsRef.current = parsed;
      } catch (e) {
        console.error('Error parsing stored records:', e);
      }
    }

    const storedEndpoint = localStorage.getItem(ENDPOINT_KEY);
    if (storedEndpoint) {
      setEndpointUrlState(storedEndpoint);
    }

    const storedEventInfo = localStorage.getItem(EVENT_INFO_KEY);
    if (storedEventInfo) {
      try {
        setEventInfoState(JSON.parse(storedEventInfo));
      } catch (e) {
        console.error('Error parsing stored event info:', e);
      }
    }
  }, []);

  // Guardar registros en localStorage (usa functional update)
  const persistRecords = useCallback((newRecords: BeneficiaryRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  }, []);

  // Añadir nuevo registro
  const addRecord = useCallback((record: Omit<BeneficiaryRecord, 'id' | 'createdAt'>) => {
    const newRecord: BeneficiaryRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => {
      const updated = [newRecord, ...prev];
      persistRecords(updated);
      recordsRef.current = updated;
      return updated;
    });
    return newRecord;
  }, [persistRecords]);

  // Actualizar estado de un registro
  const updateRecordStatus = useCallback((id: string, status: BeneficiaryRecord['status'], serverResponse?: string) => {
    setRecords(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, status, serverResponse } : r
      );
      persistRecords(updated);
      recordsRef.current = updated;
      return updated;
    });
  }, [persistRecords]);

  // Eliminar registro
  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      persistRecords(updated);
      recordsRef.current = updated;
      return updated;
    });
  }, [persistRecords]);

  // Configurar endpoint URL
  const setEndpointUrl = useCallback((url: string) => {
    localStorage.setItem(ENDPOINT_KEY, url);
    setEndpointUrlState(url);
  }, []);

  // Configurar información del evento
  const setEventInfo = useCallback((info: EventInfo) => {
    localStorage.setItem(EVENT_INFO_KEY, JSON.stringify(info));
    setEventInfoState(info);
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
      // En producción (Vercel), usar proxy para evitar CORS
      const isProduction = window.location.hostname !== 'localhost';

      let response: Response;
      if (isProduction) {
        response = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: endpointUrl, ...payload }),
        });
      } else {
        response = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        });
      }

      const responseText = await response.text();
      console.log('[sendToGoogleSheets] Status:', response.status, 'Response:', responseText);

      if (!response.ok) {
        const errorMsg = `Error del servidor (${response.status}): ${responseText.substring(0, 200)}`;
        updateRecordStatus(record.id, 'error', errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch {
        // Si no es JSON pero la respuesta fue 2xx, asumir éxito
        updateRecordStatus(record.id, 'sent', 'Enviado correctamente');
        setIsLoading(false);
        return { success: true, message: 'Registro enviado correctamente' };
      }

      if (result.result === 'duplicate') {
        updateRecordStatus(record.id, 'error', result.message);
        setIsLoading(false);
        return { success: false, message: result.message };
      }

      if (result.result === 'success') {
        updateRecordStatus(record.id, 'sent', 'Enviado correctamente');
        setIsLoading(false);
        return { success: true, message: 'Registro enviado correctamente' };
      }

      // Error genérico del servidor
      const serverError = result.error || result.message || 'Error desconocido del servidor';
      updateRecordStatus(record.id, 'error', serverError);
      setIsLoading(false);
      return { success: false, message: serverError };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[sendToGoogleSheets] Error:', error);
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
      const isProduction = window.location.hostname !== 'localhost';
      const testPayload = { test: true, timestamp: new Date().toISOString() };

      let response: Response;
      if (isProduction) {
        response = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: endpointUrl, ...testPayload }),
        });
      } else {
        response = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(testPayload),
        });
      }
      const text = await response.text();
      return { success: true, message: 'Conexión establecida correctamente' };
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
    eventInfo,
    isLoading,
    addRecord,
    updateRecordStatus,
    deleteRecord,
    setEndpointUrl,
    setEventInfo,
    sendToGoogleSheets,
    testConnection,
    exportToCSV,
  };
}

