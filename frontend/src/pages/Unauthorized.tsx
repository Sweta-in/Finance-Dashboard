import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

// ═══════════════════════════════════════════════════════════════
// Unauthorized (403) Page
// ═══════════════════════════════════════════════════════════════

const ROLE_PERMISSIONS = [
  {
    role: 'VIEWER',
    color: '#6B8099',
    pages: ['Records (read-only)'],
  },
  {
    role: 'ANALYST',
    color: '#3D8EFF',
    pages: ['Dashboard', 'Records', 'High Value Transactions'],
  },
  {
    role: 'ADMIN',
    color: '#9B6DFF',
    pages: ['All pages', 'CRUD operations', 'User management'],
  },
] as const;

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToHome = () => {
    if (user?.role === 'VIEWER') {
      navigate('/records');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg w-full"
      >
        {/* Large 403 text */}
        <h1
          className="text-8xl font-black mb-4 bg-gradient-to-r from-[#FF3B5C] to-[#FF3B5C]/40 bg-clip-text text-transparent"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          403
        </h1>

        {/* Access Restricted heading */}
        <h2
          className="text-2xl font-semibold text-[#EDF2FA] mt-4"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Access Restricted
        </h2>

        {/* Dynamic message */}
        <p className="text-[#6B8099] text-sm mt-2">
          This page requires{' '}
          <span className="text-[#EDF2FA] font-medium">ANALYST</span> or{' '}
          <span className="text-[#EDF2FA] font-medium">ADMIN</span> role.
          {user && (
            <>
              {' '}Your current role is{' '}
              <span className="text-[#FF3B5C] font-mono font-medium">
                {user.role}
              </span>
              .
            </>
          )}
        </p>

        {/* Role permission table */}
        <div className="mt-8 bg-[#0C1221] border border-[#1A2640] rounded-xl overflow-hidden text-left">
          <div className="px-4 py-3 border-b border-[#1A2640]">
            <p className="text-xs text-[#6B8099] uppercase tracking-wider font-medium">
              Role Permissions
            </p>
          </div>
          <div className="divide-y divide-[#1A2640]">
            {ROLE_PERMISSIONS.map((rp) => {
              const isCurrentRole = user?.role === rp.role;
              return (
                <div
                  key={rp.role}
                  className={`flex items-center justify-between px-4 py-3 ${
                    isCurrentRole ? 'bg-[#1A2640]/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: rp.color }}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isCurrentRole ? 'text-[#EDF2FA]' : 'text-[#6B8099]'
                      }`}
                    >
                      {rp.role}
                      {isCurrentRole && (
                        <span className="ml-2 text-[10px] bg-[#FF3B5C]/20 text-[#FF3B5C] px-1.5 py-0.5 rounded font-mono">
                          YOU
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B8099]">
                    {rp.pages.join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#6B8099] border border-[#1A2640] hover:border-[#243354] hover:text-[#EDF2FA] transition-all"
          >
            ← Go Back
          </button>
          <button
            onClick={goToHome}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#00E5A0] text-[#050810] hover:bg-[#00E5A0]/90 transition-all"
          >
            Go to {user?.role === 'VIEWER' ? 'Records' : 'Dashboard'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
