import { motion } from 'framer-motion';
import {
  Shield,
  Plane,
  Laptop,
  Home,
  Car,
  Target,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { cn } from '../../utils/cn';
import type { GoalResponse, GoalIcon } from '../../types';

// ── Icon mapping ──────────────────────────────────────────────

const goalIconMap: Record<GoalIcon, React.ReactNode> = {
  Emergency: <Shield className="w-5 h-5" />,
  Vacation: <Plane className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  House: <Home className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Other: <Target className="w-5 h-5" />,
};

// ── Progress color helper ─────────────────────────────────────

function progressColor(pct: number): string {
  if (pct >= 75) return '#3fb950';
  if (pct >= 40) return '#388bfd';
  return '#d29922';
}

// ── Days remaining ────────────────────────────────────────────

function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Component ─────────────────────────────────────────────────

interface GoalCardProps {
  goal: GoalResponse;
  index: number;
  onEdit: (goal: GoalResponse) => void;
  onDelete: (goal: GoalResponse) => void;
  onAddSavings: (goal: GoalResponse) => void;
}

export function GoalCard({
  goal,
  index,
  onEdit,
  onDelete,
  onAddSavings,
}: GoalCardProps) {
  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
    : 0;

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const isCompleted = goal.status === 'COMPLETED';
  const days = daysLeft(goal.deadline);
  const color = progressColor(pct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div
        className={cn(
          'bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl transition-all duration-200',
          'hover:border-[var(--bg-border-bright)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
          isCompleted && 'ring-1 ring-[#3fb950]/30'
        )}
      >
        {/* ── Top row: Icon + Name + Days + Actions ────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color,
              }}
            >
              {goalIconMap[goal.icon] || goalIconMap.Other}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)] truncate">
                {goal.goalName}
              </h3>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-body bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              ) : (
                <p className="text-xs font-body text-[var(--text-muted)] mt-0.5">
                  {days} day{days !== 1 ? 's' : ''} left
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              title="Edit goal"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Middle: Saved amount + Progress bar ──────────────── */}
        <div className="px-5 pb-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-mono font-bold" style={{ color }}>
              {formatINR(goal.savedAmount)}
            </span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color }}
            >
              {pct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* ── Bottom: Target + Remaining ───────────────────────── */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <p className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider">
              Target
            </p>
            <p className="text-xs font-mono font-medium text-[var(--text-secondary)]">
              {formatINR(goal.targetAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider">
              Remaining
            </p>
            <p className="text-xs font-mono font-medium text-[var(--text-secondary)]">
              {formatINR(remaining)}
            </p>
          </div>
        </div>

        {/* ── Footer: Add Savings button ───────────────────────── */}
        {!isCompleted && (
          <div className="border-t border-[var(--bg-border)] px-5 py-3">
            <button
              onClick={() => onAddSavings(goal)}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-[var(--accent-blue)] hover:text-[var(--accent-green)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Savings
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
