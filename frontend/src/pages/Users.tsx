import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, UserCheck, UserX, Shield } from 'lucide-react';
import { useUsersList, useUpdateUser } from '../hooks/useUsers';
import { Card } from '../components/ui/Card';
import { Badge, roleBadgeVariant, statusBadgeVariant } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';
import type { Role, Status } from '../types';

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const pageSize = 20;

  const { data, isLoading } = useUsersList({
    page,
    size: pageSize,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  const updateUser = useUpdateUser();

  const users = data?.data || [];

  // Calculate stats
  const totalUsers = data?.totalElements || 0;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.status === 'INACTIVE').length;
  const roleBreakdown = {
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    ANALYST: users.filter((u) => u.role === 'ANALYST').length,
    VIEWER: users.filter((u) => u.role === 'VIEWER').length,
  };

  function handleRoleChange(userId: string, newRole: Role) {
    updateUser.mutate({ id: userId, data: { role: newRole } });
  }

  function handleStatusToggle(userId: string, currentStatus: Status) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUser.mutate({ id: userId, data: { status: newStatus } });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" hover>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-blue)]/10 flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-[var(--accent-blue)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-body">Total Users</p>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">
                {totalUsers}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm" hover>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[var(--accent-green)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-body">Active</p>
              <p className="text-lg font-mono font-bold text-[var(--accent-green)]">
                {activeCount}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm" hover>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-red)]/10 flex items-center justify-center">
              <UserX className="w-4 h-4 text-[var(--accent-red)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-body">Inactive</p>
              <p className="text-lg font-mono font-bold text-[var(--accent-red)]">
                {inactiveCount}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm" hover>
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-purple)]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[var(--accent-purple)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-body">By Role</p>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                <span className="text-[var(--accent-purple)]">{roleBreakdown.ADMIN}A</span>{' '}
                <span className="text-[var(--accent-blue)]">{roleBreakdown.ANALYST}An</span>{' '}
                <span className="text-[var(--text-muted)]">{roleBreakdown.VIEWER}V</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex items-end gap-4">
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(0); }}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'ANALYST', label: 'Analyst' },
              { value: 'VIEWER', label: 'Viewer' },
            ]}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as Status | ''); setPage(0); }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      </Card>

      {/* Users table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--bg-border)]">
          <div className="grid grid-cols-5 gap-4 text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : users.length === 0 ? (
          <EmptyState title="No users found" message="No users match the current filters." />
        ) : (
          users.map((user, i) => (
            <div
              key={user.id}
              className={cn(
                'grid grid-cols-5 gap-4 px-4 py-3 items-center transition-colors hover:bg-[var(--bg-elevated)]/50 border-b border-[var(--bg-border)] last:border-b-0',
                i % 2 === 1 && 'bg-[var(--bg-base)]/30'
              )}
            >
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-[var(--text-primary)] truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-body text-[var(--text-muted)] truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role — inline editable */}
              <div>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  className="bg-[var(--bg-base)] border border-[var(--bg-border)] rounded px-2 py-1 text-xs font-body text-[var(--text-primary)] focus:outline-none focus:border-[var(--bg-border-bright)] transition-colors cursor-pointer"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              {/* Status toggle */}
              <div>
                <button
                  onClick={() => handleStatusToggle(user.id, user.status)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={cn(
                      'relative w-9 h-5 rounded-full transition-colors duration-200',
                      user.status === 'ACTIVE' ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-border)]'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                        user.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0.5'
                      )}
                    />
                  </div>
                  <Badge variant={statusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </button>
              </div>

              {/* Joined */}
              <span className="text-xs font-body text-[var(--text-secondary)]">
                {formatDate(user.createdAt)}
              </span>

              {/* Actions */}
              <div className="text-right">
                {user.status === 'ACTIVE' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusToggle(user.id, user.status)}
                    className="text-[var(--accent-red)] hover:text-[var(--accent-red)]"
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-body text-[var(--text-secondary)]">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.totalElements)} of{' '}
            {data.totalElements} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasPrevious}
              onClick={() => setPage(page - 1)}
              icon={<ChevronLeft className="w-3 h-3" />}
            >
              Prev
            </Button>
            <span className="text-xs font-mono text-[var(--text-secondary)] px-3">
              {page + 1} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasNext}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
