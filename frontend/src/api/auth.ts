import api from './axios';
import type { UserResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthData {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export const login = async (
  credentials: LoginRequest
): Promise<AuthData> => {
  const response = await api.post('/api/v1/auth/login', credentials);
  // Backend returns: { success, data: { token, tokenType, user } }
  return response.data.data as AuthData;
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthData> => {
  const response = await api.post('/api/v1/auth/register', data);
  return response.data.data as AuthData;
};

export const getMe = async (): Promise<UserResponse> => {
  const response = await api.get('/api/v1/auth/me');
  return response.data.data as UserResponse;
};
