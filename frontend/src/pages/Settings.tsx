import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { Badge, roleBadgeVariant } from '../components/ui/Badge';
import { formatDate } from '../utils/date';

export default function Settings() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-6"
    >
      <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
        Settings
      </h1>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--bg-border)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-xl font-bold text-white font-mono">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-[var(--text-primary)]">
              {user?.name}
            </h2>
            <p className="text-sm font-body text-[var(--text-secondary)]">{user?.email}</p>
            <Badge variant={roleBadgeVariant(user?.role || 'VIEWER')} className="mt-1">
              {user?.role}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-body text-[var(--text-secondary)]">Account Status</span>
            <Badge variant={user?.status === 'ACTIVE' ? 'active' : 'inactive'}>
              {user?.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-body text-[var(--text-secondary)]">Member Since</span>
            <span className="text-sm font-mono text-[var(--text-primary)]">
              {user?.createdAt ? formatDate(user.createdAt) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-body text-[var(--text-secondary)]">User ID</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {user?.id || '—'}
            </span>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="text-sm font-body font-medium text-[var(--text-primary)]">
            Application
          </h3>
        </div>
        <p className="text-sm font-body text-[var(--text-muted)]">
          Additional settings and preferences will be available in a future update.
        </p>
      </Card>
    </motion.div>
  );
}
