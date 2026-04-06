import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { CreateGoalData, GoalIcon } from '../../types';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalData) => void;
  loading?: boolean;
  /** If provided, pre-fills the form for editing */
  initialData?: Partial<CreateGoalData>;
  mode?: 'create' | 'edit';
}

const ICON_OPTIONS: { value: GoalIcon; label: string }[] = [
  { value: 'Emergency', label: '🛡️ Emergency' },
  { value: 'Vacation', label: '✈️ Vacation' },
  { value: 'Laptop', label: '💻 Laptop' },
  { value: 'House', label: '🏠 House' },
  { value: 'Car', label: '🚗 Car' },
  { value: 'Other', label: '🎯 Other' },
];

export function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
  mode = 'create',
}: CreateGoalModalProps) {
  const [goalName, setGoalName] = useState(initialData?.goalName ?? '');
  const [icon, setIcon] = useState<GoalIcon>(initialData?.icon ?? 'Other');
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount?.toString() ?? ''
  );
  const [deadline, setDeadline] = useState(initialData?.deadline ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !targetAmount || !deadline) return;
    onSubmit({
      goalName: goalName.trim(),
      icon,
      targetAmount: parseFloat(targetAmount),
      deadline,
    });
  };

  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Goal' : 'Create New Goal'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Name"
          placeholder="e.g. Emergency Fund"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          required
        />

        <Select
          label="Icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value as GoalIcon)}
          options={ICON_OPTIONS}
        />

        <Input
          label="Target Amount (₹)"
          type="number"
          placeholder="e.g. 500000"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          min="1"
          step="0.01"
          required
        />

        <Input
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
