import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryKeys } from './queryKeys';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../api/records';
import type { RecordParams, CreateRecordData } from '../types';

export function useRecordsList(params: RecordParams) {
  return useQuery({
    queryKey: queryKeys.RECORDS_LIST(params),
    queryFn: () => getRecords(params),
  });
}

export function useRecordDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.RECORD_DETAIL(id),
    queryFn: () => getRecord(id),
    enabled: !!id,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecordData) => createRecord(data),
    onSuccess: () => {
      toast.success('Record created successfully');
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast.error('Failed to create record');
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecordData> }) =>
      updateRecord(id, data),
    onSuccess: () => {
      toast.success('Record updated successfully');
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast.error('Failed to update record');
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecord(id),
    onSuccess: () => {
      toast.success('Record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast.error('Failed to delete record');
    },
  });
}
