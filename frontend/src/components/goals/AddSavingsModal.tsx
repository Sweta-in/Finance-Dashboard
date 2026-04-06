import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatINR } from '../../utils/currency';
import type { GoalResponse } from '../../types';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  goal: GoalResponse;
  loading?: boolean;
}

export function AddSavingsModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
  loading = false,
}: AddSavingsModalProps) {
  const [amount, setAmount] = useState('');
  const remaining = goal.targetAmount - goal.savedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    onSubmit(value);
    setAmount('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Savings" size="sm">
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Saved
            </p>
            <p className="text-sm font-mono font-bold text-[var(--accent-green)]">
              {formatINR(goal.savedAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Target
            </p>
            <p className="text-sm font-mono font-bold text-[var(--text-primary)]">
              {formatINR(goal.targetAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-body text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Remaining
            </p>
            <p className="text-sm font-mono font-bold text-[var(--accent-orange)]">
              {formatINR(remaining)}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--bg-border)]" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount to Add (₹)"
            type="number"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Add Savings
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
