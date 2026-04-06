import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import {
  getSummary,
  getTrends,
  getCategoryBreakdown,
  getRecentActivity,
  getHighValueTransactions,
} from '../api/dashboard';

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.DASHBOARD_SUMMARY,
    queryFn: getSummary,
  });
}

export function useDashboardTrends(months: number = 6) {
  return useQuery({
    queryKey: [...queryKeys.DASHBOARD_TRENDS, months],
    queryFn: () => getTrends(months),
  });
}

export function useDashboardCategories() {
  return useQuery({
    queryKey: queryKeys.DASHBOARD_CATEGORIES,
    queryFn: getCategoryBreakdown,
  });
}

export function useDashboardRecent() {
  return useQuery({
    queryKey: queryKeys.DASHBOARD_RECENT,
    queryFn: getRecentActivity,
  });
}

export function useHighValueTransactions(threshold: number, type: string) {
  return useQuery({
    queryKey: queryKeys.DASHBOARD_HIGH_VALUE(threshold, type),
    queryFn: () => getHighValueTransactions(threshold, type),
  });
}
