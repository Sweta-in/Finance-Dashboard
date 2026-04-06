import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../api/auth';

// ═══════════════════════════════════════════════════════════════
// Login Page — Institutional-grade Finance OS login
// ═══════════════════════════════════════════════════════════════

interface FieldErrors {
  email?: string;
  password?: string;
}

const DEMO_CREDENTIALS = [
  { label: '👑 Admin', email: 'admin@finance.dev', password: 'Admin@123' },
  { label: '📊 Analyst', email: 'analyst@finance.dev', password: 'Analyst@123' },
  { label: '👁 Viewer', email: 'viewer@finance.dev', password: 'Viewer@123' },
] as const;

const ROLE_CARDS = [
  {
    emoji: '🟣',
    role: 'ADMIN',
    badgeBg: 'bg-[#9B6DFF]/20',
    badgeText: 'text-[#9B6DFF]',
    desc: 'Full access — manage records & users',
  },
  {
    emoji: '🔵',
    role: 'ANALYST',
    badgeBg: 'bg-[#3D8EFF]/20',
    badgeText: 'text-[#3D8EFF]',
    desc: 'View + dashboard analytics',
  },
  {
    emoji: '⚫',
    role: 'VIEWER',
    badgeBg: 'bg-[#6B8099]/20',
    badgeText: 'text-[#6B8099]',
    desc: 'Read-only record access',
  },
] as const;

const FEATURES = [
  { icon: '📊', text: 'Live analytics — income, expense trends, category breakdown' },
  { icon: '🔒', text: 'Role-based access — admins, analysts, and viewers' },
  { icon: '📋', text: 'Audit-grade records with idempotency and soft deletes' },
] as const;

export default function Login() {
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [shakeKey, setShakeKey] = useState(0);

  // If already logged in, redirect
  if (isAuthenticated && user && !authLoading) {
    return <Navigate to={user.role === 'VIEWER' ? '/records' : '/dashboard'} replace />;
  }

  // ── Client-side validation ───────────────────────────────────
  function validate(): boolean {
    const errors: FieldErrors = {};
    let valid = true;

    if (!email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      errors.password = 'Password too short';
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  }

  // ── Submit handler ───────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const authData = await apiLogin({ email, password });
      const { token, user: loggedInUser } = authData;

      // Save to context
      login(token, loggedInUser);

      // Toast
      toast.success(`Welcome back, ${loggedInUser.name}! 👋`);

      // Redirect based on role
      if (loggedInUser.role === 'VIEWER') {
        navigate('/records');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const status = err?.status;
      if (status === 401) {
        setErrorMessage('Invalid email or password');
      } else if (status === 403) {
        setErrorMessage('Your account has been deactivated');
      } else if (!err?.status) {
        setErrorMessage('Cannot connect to server');
      } else {
        setErrorMessage(err?.message || 'An unexpected error occurred');
      }
      // Trigger shake
      setShakeKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  // ── Fill demo credentials ────────────────────────────────────
  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setFieldErrors({});
  }

  // ── Input class ──────────────────────────────────────────────
  const inputClass =
    'w-full bg-[#080D1A] border border-[#1A2640] rounded-lg px-4 py-3 text-[#EDF2FA] font-mono text-sm placeholder:text-[#2D4060] focus:border-[#3D8EFF] focus:outline-none focus:ring-0 transition-colors';

  return (
    <div className="min-h-screen bg-[#050810] flex relative overflow-hidden">
      {/* ── Animated grid background ──────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#1A2640 1px, transparent 1px),
                            linear-gradient(90deg, #1A2640 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'gridMove 20s linear infinite',
          opacity: 0.15,
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          LEFT COLUMN — Branding (hidden on mobile)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo row */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#00E5A0] flex items-center justify-center">
              <span className="text-black font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                FO
              </span>
            </div>
            <span
              className="text-[#EDF2FA] tracking-widest text-sm font-semibold"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              FINANCE OS
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl font-bold mb-8"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            <span className="text-[#EDF2FA]">Institutional-grade</span>
            <br />
            <span className="text-[#00E5A0]">financial intelligence.</span>
          </h1>

          {/* Feature rows */}
          <div className="space-y-4 mb-12">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3"
              >
                <span className="text-lg mt-0.5">{feature.icon}</span>
                <span className="text-[#6B8099] text-sm leading-relaxed">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-3 gap-3">
            {ROLE_CARDS.map((card, i) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-lg border border-[#1A2640] bg-[#0C1221] p-3"
              >
                <div className="text-lg mb-2">{card.emoji}</div>
                <span
                  className={`inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded ${card.badgeBg} ${card.badgeText}`}
                >
                  {card.role}
                </span>
                <p className="text-[#6B8099] text-xs mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT COLUMN — Login Form
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 20 }}
          animate={
            shakeKey > 0
              ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
              : { opacity: 1, y: 0 }
          }
          transition={
            shakeKey > 0
              ? { x: { duration: 0.4 }, opacity: { duration: 0.5 }, y: { duration: 0.5 } }
              : { duration: 0.5, delay: 0.2 }
          }
          className="w-full max-w-md bg-[#0C1221]/80 backdrop-blur-xl border border-[#1A2640] rounded-2xl p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[#EDF2FA]"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Welcome back
            </h2>
            <p className="text-[#6B8099] text-sm mt-1">
              Sign in to your workspace
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 rounded-lg p-3 text-[#FF3B5C] text-sm mb-6"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-[#6B8099] text-xs uppercase tracking-wider mb-2 font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D4060]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@company.dev"
                  className={`${inputClass} pl-10`}
                  autoComplete="email"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[#FF3B5C] text-xs mt-1"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[#6B8099] text-xs uppercase tracking-wider mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D4060]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10 pr-12`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D4060] hover:text-[#6B8099] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[#FF3B5C] text-xs mt-1"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-3 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-[#00E5A0]/50 text-[#050810] cursor-not-allowed'
                  : 'bg-[#00E5A0] text-[#050810] hover:bg-[#00E5A0]/90 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          {/* Demo credentials section */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-1 border-t border-[#1A2640]" />
              <span className="text-[#6B8099] text-xs">or use demo account</span>
              <span className="flex-1 border-t border-[#1A2640]" />
            </div>

            <div className="flex gap-2 justify-center">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => fillDemo(demo.email, demo.password)}
                  className="rounded-full border border-[#1A2640] px-3 py-1.5 text-xs text-[#6B8099] cursor-pointer hover:border-[#243354] hover:bg-[#111827] transition-all"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[#2D4060] text-xs text-center mt-6">
            Secured with JWT · Role-based access · Audit logging
          </p>
        </motion.div>
      </div>
    </div>
  );
}
