import api from './axios';
import type {
  ApiResponse,
  PagedResponse,
  UpdateUserData,
  UserParams,
  UserResponse,
} from '../types';

export async function getUsers(params: UserParams): Promise<PagedResponse<UserResponse>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const res = await api.get('/api/v1/users', {
    params: cleanParams,
  });
  return res.data as PagedResponse<UserResponse>;
}

export async function updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
  const res = await api.patch(`/api/v1/users/${id}`, data);
  return (res.data as ApiResponse<UserResponse>).data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/v1/users/${id}`);
}
