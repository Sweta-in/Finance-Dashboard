// ═══════════════════════════════════════════════════════════════
// TypeScript interfaces — matching backend API contracts exactly
// ═══════════════════════════════════════════════════════════════

export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE';
export type RecordType = 'INCOME' | 'EXPENSE';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface RecordResponse {
  id: string;
  transactionRef: string;
  amount: number;
  type: RecordType;
  category: string;
  recordDate: string;
  notes: string;
  createdBy: UserResponse;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalRecords: number;
  incomeGrowthPercent: number;
  expenseGrowthPercent: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySummary {
  category: string;
  type: RecordType;
  total: number;
  recordCount: number;
  percentage: number;
}

// ── API Response Wrappers ──────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string>;
}

export interface PagedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  timestamp: string;
  path: string;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ── Auth ───────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// ── Records ────────────────────────────────────────────────────

export interface CreateRecordData {
  amount: number;
  type: RecordType;
  category: string;
  recordDate: string;
  notes: string;
  transactionRef?: string;
}

export interface RecordParams {
  type?: RecordType | '';
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ── Users ──────────────────────────────────────────────────────

export interface UpdateUserData {
  role?: Role;
  status?: Status;
}

export interface UserParams {
  page?: number;
  size?: number;
  role?: Role | '';
  status?: Status | '';
}

// ── Anomaly Detection ─────────────────────────────────────────

export type AnomalyType = 'HIGH_AMOUNT' | 'SUDDEN_SPIKE';

export interface AnomalyItem {
  recordId: number;
  amount: number;
  date: string;
  anomalyType: AnomalyType;
  severityScore: number; // 0.0 to 1.0
  description: string;
}

// ── Goals ─────────────────────────────────────────────────────

export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED';
export type GoalIcon = 'Emergency' | 'Vacation' | 'Laptop' | 'House' | 'Car' | 'Other';

export interface GoalResponse {
  id: number;
  goalName: string;
  icon: GoalIcon;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  goalName: string;
  icon: GoalIcon;
  targetAmount: number;
  deadline: string;
}

export interface AddSavingsData {
  amount: number;
}

