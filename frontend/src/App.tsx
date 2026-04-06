import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import RecordCreate from './pages/RecordCreate';
import RecordEdit from './pages/RecordEdit';
import HighValue from './pages/HighValue';
import UsersPage from './pages/Users';
import Unauthorized from './pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Redirect / based on role ──────────────────────────────────
function RoleBasedRedirect() {
  const { user } = useAuth();
  if (user?.role === 'VIEWER') return <Navigate to="/records" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0C1221',
                color: '#EDF2FA',
                border: '1px solid #1A2640',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#00E5A0', secondary: '#050810' },
              },
              error: {
                iconTheme: { primary: '#FF3B5C', secondary: '#050810' },
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected — all roles */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppShell />
                </PrivateRoute>
              }
            >
              {/* Default redirect based on role */}
              <Route index element={<RoleBasedRedirect />} />

              {/* VIEWER + ANALYST + ADMIN */}
              <Route path="records" element={<Records />} />
              <Route
                path="records/new"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <RecordCreate />
                  </PrivateRoute>
                }
              />
              <Route
                path="records/:id/edit"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <RecordEdit />
                  </PrivateRoute>
                }
              />

              {/* ANALYST + ADMIN only */}
              <Route
                path="dashboard"
                element={
                  <PrivateRoute roles={['ANALYST', 'ADMIN']}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="high-value"
                element={
                  <PrivateRoute roles={['ANALYST', 'ADMIN']}>
                    <HighValue />
                  </PrivateRoute>
                }
              />

              {/* ADMIN only */}
              <Route
                path="users"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <UsersPage />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
