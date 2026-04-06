import api from './axios';
import type { ApiResponse, GoalResponse, CreateGoalData, AddSavingsData } from '../types';

export async function getGoals(): Promise<GoalResponse[]> {
  const res = await api.get('/api/v1/goals');
  return (res.data as ApiResponse<GoalResponse[]>).data;
}

export async function createGoal(data: CreateGoalData): Promise<GoalResponse> {
  const res = await api.post('/api/v1/goals', data);
  return (res.data as ApiResponse<GoalResponse>).data;
}

export async function updateGoal(
  id: number,
  data: Partial<CreateGoalData>
): Promise<GoalResponse> {
  const res = await api.put(`/api/v1/goals/${id}`, data);
  return (res.data as ApiResponse<GoalResponse>).data;
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete(`/api/v1/goals/${id}`);
}

export async function addSavings(
  id: number,
  data: AddSavingsData
): Promise<GoalResponse> {
  const res = await api.post(`/api/v1/goals/${id}/savings`, data);
  return (res.data as ApiResponse<GoalResponse>).data;
}
