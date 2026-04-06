import api from './axios';
import type { ApiResponse, AnomalyItem } from '../types';

export interface AnomalyParams {
  type?: 'HIGH_AMOUNT' | 'SUDDEN_SPIKE';
  from?: string;
  to?: string;
}

export async function getAnomalies(params?: AnomalyParams): Promise<AnomalyItem[]> {
  const res = await api.get('/api/v1/dashboard/anomalies', { params });
  return (res.data as ApiResponse<AnomalyItem[]>).data;
}
