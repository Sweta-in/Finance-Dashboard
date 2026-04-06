import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Wallet,
  Plus,
} from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useAddSavings } from '../hooks/useGoals';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { GoalCard } from '../components/goals/GoalCard';
import { CreateGoalModal } from '../components/goals/CreateGoalModal';
import { AddSavingsModal } from '../components/goals/AddSavingsModal';
import { formatINR } from '../utils/currency';
import type { GoalResponse, CreateGoalData } from '../types';

// ── Skeleton for loading state ──────────────────────────────────

function GoalCardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────

export default function Goals() {
  const { data, isLoading, isError, refetch } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const addSavingsMutation = useAddSavings();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);
  const [savingsGoal, setSavingsGoal] = useState<GoalResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalResponse | null>(null);

  const goals = data ?? [];

  // ── Summary stats ──────────────────────────────────────────────

  const totalGoals = goals.length;
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === 'COMPLETED').length,
    [goals]
  );
  const totalSaved = useMemo(
    () => goals.reduce((sum, g) => sum + g.savedAmount, 0),
    [goals]
  );
  const totalTarget = useMemo(
    () => goals.reduce((sum, g) => sum + g.targetAmount, 0),
    [goals]
  );

  const statCards = [
    {
      label: 'Total Goals',
      value: totalGoals,
      icon: <Target className="w-5 h-5" />,
      color: 'var(--accent-blue)',
    },
    {
      label: 'Completed Goals',
      value: completedGoals,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'var(--accent-green)',
    },
    {
      label: 'Total Saved',
      value: formatINR(totalSaved),
      icon: <Wallet className="w-5 h-5" />,
      color: 'var(--accent-purple)',
    },
  ];

  // ── Handlers ──────────────────────────────────────────────────

  const handleCreate = (data: CreateGoalData) => {
    createGoal.mutate(data, {
      onSuccess: () => setShowCreateModal(false),
    });
  };

  const handleEdit = (data: CreateGoalData) => {
    if (!editingGoal) return;
    updateGoal.mutate(
      { id: editingGoal.id, data },
      { onSuccess: () => setEditingGoal(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteGoalMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleAddSavings = (amount: number) => {
    if (!savingsGoal) return;
    addSavingsMutation.mutate(
      { id: savingsGoal.id, data: { amount } },
      { onSuccess: () => setSavingsGoal(null) }
    );
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Goal Tracker
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-body mt-1">
            {isLoading
              ? 'Loading goals...'
              : `${formatINR(totalSaved)} saved of ${formatINR(totalTarget)} total target`}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Goal
        </Button>
      </div>

      {/* ── Summary Stat Bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <p className="text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
              <p
                className="text-3xl font-mono font-bold"
                style={{ color: stat.color }}
              >
                {isLoading ? '—' : stat.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Goals Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load goals"
          message="Goal data could not be retrieved. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          message="Start by creating your first goal."
          icon={<Target className="w-7 h-7 text-[var(--text-muted)]" />}
          actionLabel="Create Goal"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onEdit={(g) => setEditingGoal(g)}
              onDelete={(g) => setDeleteTarget(g)}
              onAddSavings={(g) => setSavingsGoal(g)}
            />
          ))}
        </div>
      )}

      {/* ── Create Goal Modal ────────────────────────────────────── */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        loading={createGoal.isPending}
        mode="create"
      />

      {/* ── Edit Goal Modal ──────────────────────────────────────── */}
      {editingGoal && (
        <CreateGoalModal
          key={`edit-${editingGoal.id}`}
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleEdit}
          loading={updateGoal.isPending}
          mode="edit"
          initialData={{
            goalName: editingGoal.goalName,
            icon: editingGoal.icon,
            targetAmount: editingGoal.targetAmount,
            deadline: editingGoal.deadline,
          }}
        />
      )}

      {/* ── Add Savings Modal ────────────────────────────────────── */}
      {savingsGoal && (
        <AddSavingsModal
          key={`savings-${savingsGoal.id}`}
          isOpen={!!savingsGoal}
          onClose={() => setSavingsGoal(null)}
          onSubmit={handleAddSavings}
          goal={savingsGoal}
          loading={addSavingsMutation.isPending}
        />
      )}

      {/* ── Delete Confirmation ──────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-xl shadow-2xl z-10 p-6"
          >
            <h3 className="text-base font-display font-semibold text-[var(--text-primary)] mb-2">
              Delete Goal
            </h3>
            <p className="text-sm font-body text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete "
              <span className="font-medium text-[var(--text-primary)]">
                {deleteTarget.goalName}
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={deleteGoalMutation.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
