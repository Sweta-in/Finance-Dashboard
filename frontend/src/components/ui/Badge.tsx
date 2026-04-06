import { cn } from '../../utils/cn';
import type { Role, Status, RecordType } from '../../types';

type BadgeVariant = 'admin' | 'analyst' | 'viewer' | 'active' | 'inactive' | 'income' | 'expense' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  admin: 'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] border-[var(--accent-purple)]/30',
  analyst: 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/30',
  viewer: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--bg-border)]',
  active: 'bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30',
  inactive: 'bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30',
  income: 'bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30',
  expense: 'bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30',
  default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--bg-border)]',
};

function getVariant(input?: string): BadgeVariant {
  if (!input) return 'default';
  const lower = input.toLowerCase();
  if (lower in variantStyles) return lower as BadgeVariant;
  return 'default';
}

export function roleBadgeVariant(role: Role): BadgeVariant {
  const map: Record<Role, BadgeVariant> = {
    ADMIN: 'admin',
    ANALYST: 'analyst',
    VIEWER: 'viewer',
  };
  return map[role];
}

export function statusBadgeVariant(status: Status): BadgeVariant {
  return status === 'ACTIVE' ? 'active' : 'inactive';
}

export function typeBadgeVariant(type: RecordType): BadgeVariant {
  return type === 'INCOME' ? 'income' : 'expense';
}

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-body border transition-colors',
        variantStyles[getVariant(variant)],
        className
      )}
    >
      {children}
    </span>
  );
}
