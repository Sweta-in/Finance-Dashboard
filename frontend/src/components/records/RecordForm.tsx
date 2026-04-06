import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, typeBadgeVariant } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { IndianRupee, Calendar, FileText } from 'lucide-react';
import type { CreateRecordData, RecordType } from '../../types';

const incomeCategories = [
  'Salary', 'Freelance', 'Consulting', 'Investment Return',
  'UPI Collection', 'API Gateway Revenue', 'Interest Credit',
  'Refund Received', 'Dividends',
];

const expenseCategories = [
  'AWS EC2', 'RDS Storage', 'GitHub Actions', 'Razorpay Fee',
  'Office Broadband', 'Zoom Pro', 'Postman Plan', 'Docker Hub',
  'Equipment', 'Travel', 'Insurance', 'Marketing',
];

interface RecordFormProps {
  initialData?: Partial<CreateRecordData>;
  onSubmit: (data: CreateRecordData) => void;
  isLoading?: boolean;
  submitLabel?: string;
  metadata?: {
    createdBy?: string;
    updatedAt?: string;
  };
}

export function RecordForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Record',
  metadata,
}: RecordFormProps) {
  const [form, setForm] = useState<CreateRecordData>({
    amount: initialData?.amount || 0,
    type: initialData?.type || 'EXPENSE',
    category: initialData?.category || '',
    recordDate: initialData?.recordDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
    transactionRef: initialData?.transactionRef || '',
  });
  const [autoRef, setAutoRef] = useState(!initialData?.transactionRef);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount || 0,
        type: initialData.type || 'EXPENSE',
        category: initialData.category || '',
        recordDate: initialData.recordDate || new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
        transactionRef: initialData.transactionRef || '',
      });
    }
  }, [initialData]);

  const categories = form.type === 'INCOME' ? incomeCategories : expenseCategories;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.amount || form.amount <= 0) errs.amount = 'Amount must be greater than 0';
    if (form.amount > 10000000) errs.amount = 'Amount cannot exceed ₹1 Crore';
    if (!form.category) errs.category = 'Category is required';
    if (!form.recordDate) errs.recordDate = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form };
    if (autoRef) {
      delete data.transactionRef;
    }
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Form fields */}
      <div className="lg:col-span-3 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-mono text-lg">
              ₹
            </span>
            <input
              type="number"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className={cn(
                'w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-lg pl-8 pr-4 py-4 text-2xl font-mono font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200',
                'focus:outline-none focus:border-[var(--bg-border-bright)] focus:ring-1 focus:ring-[var(--accent-blue)]/30',
                errors.amount && 'border-[var(--accent-red)]'
              )}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-[var(--accent-red)] font-body mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Type toggle */}
        <div>
          <label className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
            Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['INCOME', 'EXPENSE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
                className={cn(
                  'py-3 rounded-lg text-sm font-body font-semibold border-2 transition-all duration-200',
                  form.type === t
                    ? t === 'INCOME'
                      ? 'bg-[var(--accent-green)]/15 border-[var(--accent-green)] text-[var(--accent-green)]'
                      : 'bg-[var(--accent-red)]/15 border-[var(--accent-red)] text-[var(--accent-red)]'
                    : 'bg-transparent border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--bg-border-bright)]'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <Select
          label="Category"
          options={categories.map((c) => ({ value: c, label: c }))}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Select a category"
          error={errors.category}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={form.recordDate}
          onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
          error={errors.recordDate}
          icon={<Calendar className="w-4 h-4" />}
        />

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            placeholder="Optional notes about this transaction..."
            className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-lg px-3 py-2.5 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:border-[var(--bg-border-bright)] focus:ring-1 focus:ring-[var(--accent-blue)]/30 hover:border-[var(--bg-border-bright)] resize-none"
          />
        </div>

        {/* Transaction Ref */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider">
              Transaction Ref
            </label>
            <button
              type="button"
              onClick={() => setAutoRef(!autoRef)}
              className={cn(
                'text-xs font-body transition-colors',
                autoRef
                  ? 'text-[var(--accent-green)]'
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {autoRef ? '✓ Auto-generate' : 'Manual'}
            </button>
          </div>
          {!autoRef && (
            <Input
              value={form.transactionRef}
              onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
              placeholder="TXN-2025-XXXXXXXX"
              icon={<FileText className="w-4 h-4" />}
            />
          )}
        </div>

        {/* Metadata (edit mode) */}
        {metadata && (
          <p className="text-xs text-[var(--text-muted)] font-body">
            Created by {metadata.createdBy}
            {metadata.updatedAt && ` · Last updated ${formatDate(metadata.updatedAt)}`}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--bg-border)]">
          <Button variant="ghost" type="button" onClick={() => window.history.back()}>
            ← Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <Card className="border-dashed">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--bg-border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
              <span className="text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider">
                Live Preview
              </span>
            </div>

            <div className="space-y-4">
              {form.type && (
                <Badge variant={typeBadgeVariant(form.type)}>{form.type}</Badge>
              )}

              <p
                className={cn(
                  'text-3xl font-mono font-bold',
                  form.type === 'INCOME'
                    ? 'text-[var(--accent-green)]'
                    : 'text-[var(--accent-red)]'
                )}
                style={{
                  textShadow:
                    form.type === 'INCOME'
                      ? '0 0 20px rgba(0,229,160,0.2)'
                      : '0 0 20px rgba(255,59,92,0.2)',
                }}
              >
                {form.type === 'INCOME' ? '+' : '-'}
                {formatINR(form.amount || 0)}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-body">Category</span>
                  <span className="text-[var(--text-primary)] font-body">
                    {form.category || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-body">Date</span>
                  <span className="text-[var(--text-primary)] font-body">
                    {form.recordDate ? formatDate(form.recordDate) : '—'}
                  </span>
                </div>
                {form.notes && (
                  <div className="text-xs">
                    <span className="text-[var(--text-muted)] font-body">Notes</span>
                    <p className="text-[var(--text-secondary)] font-body mt-1">
                      {form.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
