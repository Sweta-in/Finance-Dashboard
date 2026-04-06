import api from './axios';
import type {
  ApiResponse,
  CreateRecordData,
  PagedResponse,
  RecordParams,
  RecordResponse,
} from '../types';

export async function getRecords(params: RecordParams): Promise<PagedResponse<RecordResponse>> {
  // Clean empty params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await api.get('/api/v1/records', {
    params: cleanParams,
  });
  return res.data as PagedResponse<RecordResponse>;
}

export async function getRecord(id: string): Promise<RecordResponse> {
  const res = await api.get(`/api/v1/records/${id}`);
  return (res.data as ApiResponse<RecordResponse>).data;
}

export async function createRecord(data: CreateRecordData): Promise<RecordResponse> {
  const res = await api.post('/api/v1/records', data);
  return (res.data as ApiResponse<RecordResponse>).data;
}

export async function updateRecord(
  id: string,
  data: Partial<CreateRecordData>
): Promise<RecordResponse> {
  const res = await api.put(`/api/v1/records/${id}`, data);
  return (res.data as ApiResponse<RecordResponse>).data;
}

export async function deleteRecord(id: string): Promise<void> {
  await api.delete(`/api/v1/records/${id}`);
}
