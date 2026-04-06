import api from './axios';
import type {
  ApiResponse,
  DashboardSummary,
  MonthlyTrend,
  CategorySummary,
  RecordResponse,
} from '../types';

export async function getSummary(): Promise<DashboardSummary> {
  const res = await api.get('/api/v1/dashboard/summary');
  return (res.data as ApiResponse<DashboardSummary>).data;
}

export async function getTrends(months: number = 6): Promise<MonthlyTrend[]> {
  const res = await api.get('/api/v1/dashboard/trends', {
    params: { months },
  });
  return (res.data as ApiResponse<MonthlyTrend[]>).data;
}

export async function getCategoryBreakdown(): Promise<CategorySummary[]> {
  const res = await api.get('/api/v1/dashboard/by-category');
  return (res.data as ApiResponse<CategorySummary[]>).data;
}

export async function getRecentActivity(): Promise<RecordResponse[]> {
  const res = await api.get('/api/v1/dashboard/recent');
  return (res.data as ApiResponse<RecordResponse[]>).data;
}

export async function getHighValueTransactions(
  threshold: number,
  type: string
): Promise<RecordResponse[]> {
  const res = await api.get('/api/v1/dashboard/high-value', {
    params: { threshold, type },
  });
  return (res.data as ApiResponse<RecordResponse[]>).data;
}
