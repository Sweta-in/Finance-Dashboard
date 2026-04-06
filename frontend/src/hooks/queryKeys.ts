export const queryKeys = {
  DASHBOARD_SUMMARY: ['dashboard', 'summary'] as const,
  DASHBOARD_TRENDS: ['dashboard', 'trends'] as const,
  DASHBOARD_CATEGORIES: ['dashboard', 'categories'] as const,
  DASHBOARD_RECENT: ['dashboard', 'recent'] as const,
  DASHBOARD_HIGH_VALUE: (threshold: number, type: string) =>
    ['dashboard', 'high-value', threshold, type] as const,
  RECORDS_LIST: (params: object) =>
    ['records', 'list', params] as const,
  RECORD_DETAIL: (id: string) => ['records', 'detail', id] as const,
  USERS_LIST: (params: object) =>
    ['users', 'list', params] as const,
  SEARCH: (query: string) =>
    ['search', query] as const,
};
