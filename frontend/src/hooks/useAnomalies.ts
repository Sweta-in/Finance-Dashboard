import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getAnomalies, type AnomalyParams } from '../api/anomalies';

export function useAnomalies(
  type?: AnomalyParams['type'],
  from?: string,
  to?: string
) {
  const params: AnomalyParams = {};
  if (type) params.type = type;
  if (from) params.from = from;
  if (to) params.to = to;

  return useQuery({
    queryKey: queryKeys.ANOMALIES(params),
    queryFn: () => getAnomalies(params),
  });
}
