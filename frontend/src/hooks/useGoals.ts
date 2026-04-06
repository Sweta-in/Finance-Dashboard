import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryKeys } from './queryKeys';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addSavings,
} from '../api/goals';
import type { CreateGoalData, AddSavingsData } from '../types';

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.GOALS,
    queryFn: getGoals,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalData) => createGoal(data),
    onSuccess: () => {
      toast.success('Goal created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.GOALS });
    },
    onError: () => {
      toast.error('Failed to create goal');
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateGoalData> }) =>
      updateGoal(id, data),
    onSuccess: () => {
      toast.success('Goal updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.GOALS });
    },
    onError: () => {
      toast.error('Failed to update goal');
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGoal(id),
    onSuccess: () => {
      toast.success('Goal deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.GOALS });
    },
    onError: () => {
      toast.error('Failed to delete goal');
    },
  });
}

export function useAddSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddSavingsData }) =>
      addSavings(id, data),
    onSuccess: () => {
      toast.success('Savings added successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.GOALS });
    },
    onError: () => {
      toast.error('Failed to add savings');
    },
  });
}
