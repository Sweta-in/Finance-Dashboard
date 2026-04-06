import api from './axios';

export interface SearchParams {
  q: string;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  page?: number;
  size?: number;
}

export interface SearchResultItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: string;
  date: string;
}

export interface SearchApiResponse {
  results: SearchResultItem[];
  totalCount: number;
  page: number;
  size: number;
}

export async function searchRecords(params: SearchParams): Promise<SearchApiResponse> {
  const res = await api.get('/api/v1/search', { params });
  // Search endpoint returns SearchResponse directly (not wrapped in ApiResponse)
  return res.data as SearchApiResponse;
}
