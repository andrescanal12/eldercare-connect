// Tipos para el sistema de registro de beneficiarios FIMLM

export interface FamilyCounts {
  adulto_h: number;
  adulto_m: number;
  nino_0_5: number;
  nina_0_5: number;
  nino_6_18: number;
  nina_6_18: number;
  mayor_60_hom: number;
  mayor_60_muj: number;
  pcd_h: number;
  pcd_m: number;
}

export interface BeneficiaryRecord {
  id: string;
  evento: string;
  registro: string;
  fecha_evento: string;
  ciudad: string;
  beneficios_entregados: string;
  timestamp_envio: string;
  sexo: 'H' | 'M';
  nombre_apellido: string;
  edad: number;
  telefono: string;
  domicilio: string;
  documento: string;
  firma_base64_png: string;
  // Family counts
  adulto_h: number;
  adulto_m: number;
  nino_0_5: number;
  nina_0_5: number;
  nino_6_18: number;
  nina_6_18: number;
  mayor_60_hom: number;
  mayor_60_muj: number;
  pcd_h: number;
  pcd_m: number;
  // Local metadata
  status: 'pending' | 'sent' | 'error';
  serverResponse?: string;
  createdAt: string;
}

export interface EventInfo {
  evento: string;
  registro: string;
  fecha_evento: string;
  ciudad: string;
  beneficios_entregados: string;
}

export const EVENT_INFO: EventInfo = {
  evento: "DÍA DEL ADULTO MAYOR – ESPAÑA",
  registro: "REGISTRO DE BENEFICIARIOS",
  fecha_evento: "sábado 14 de febrero 2026",
  ciudad: "Sabadell",
  beneficios_entregados: "Kits de Aseo Personal, Mantas, Bufandas, Gorros y Meriendas"
};
