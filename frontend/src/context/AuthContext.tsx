import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserResponse, Role } from '../types';

// ═══════════════════════════════════════════════════════════════
// Auth Context — manages JWT token + user state
// ═══════════════════════════════════════════════════════════════

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ── On mount: restore from localStorage ─────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('finance_token');
    const savedUser = localStorage.getItem('finance_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserResponse;
        setToken(savedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('finance_token');
        localStorage.removeItem('finance_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Login ───────────────────────────────────────────────────
  const login = useCallback(
    (newToken: string, newUser: UserResponse) => {
      localStorage.setItem('finance_token', newToken);
      localStorage.setItem('finance_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    },
    []
  );

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── Role check ────────────────────────────────────────────
  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // ── isAuthenticated ─────────────────────────────────────────
  const isAuthenticated = !!token && !!user;

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoading, isAuthenticated, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
