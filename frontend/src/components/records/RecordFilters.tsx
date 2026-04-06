import { useState } from 'react';
import { cn } from '../../utils/cn';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Filter, X, RotateCcw } from 'lucide-react';
import type { RecordType } from '../../types';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Investment Return', label: 'Investment Return' },
  { value: 'UPI Collection', label: 'UPI Collection' },
  { value: 'API Gateway Revenue', label: 'API Gateway Revenue' },
  { value: 'Interest Credit', label: 'Interest Credit' },
  { value: 'Refund Received', label: 'Refund Received' },
  { value: 'Dividends', label: 'Dividends' },
  { value: 'AWS EC2', label: 'AWS EC2' },
  { value: 'RDS Storage', label: 'RDS Storage' },
  { value: 'GitHub Actions', label: 'GitHub Actions' },
  { value: 'Razorpay Fee', label: 'Razorpay Fee' },
  { value: 'Office Broadband', label: 'Office Broadband' },
  { value: 'Zoom Pro', label: 'Zoom Pro' },
  { value: 'Postman Plan', label: 'Postman Plan' },
  { value: 'Docker Hub', label: 'Docker Hub' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Marketing', label: 'Marketing' },
];

interface Filters {
  type: RecordType | '';
  category: string;
  from: string;
  to: string;
}

interface RecordFiltersProps {
  onApply: (filters: Filters) => void;
  onReset: () => void;
}

export function RecordFilters({ onApply, onReset }: RecordFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    type: '',
    category: '',
    from: '',
    to: '',
  });

  const activeFilterCount = [filters.type, filters.category, filters.from, filters.to].filter(Boolean).length;

  function handleApply() {
    onApply(filters);
  }

  function handleReset() {
    setFilters({ type: '', category: '', from: '', to: '' });
    onReset();
  }

  function removeFilter(key: keyof Filters) {
    const updated = { ...filters, [key]: '' };
    setFilters(updated);
    onApply(updated);
  }

  return (
    <div className="space-y-3">
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-body font-medium text-[var(--text-primary)]">
            Filters
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="default">{activeFilterCount} active</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          {/* Type segmented control */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider">
              Type
            </label>
            <div className="flex rounded-lg border border-[var(--bg-border)] overflow-hidden">
              {(['', 'INCOME', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, type: t })}
                  className={cn(
                    'flex-1 text-xs py-2 font-body font-medium transition-all',
                    filters.type === t
                      ? t === 'INCOME'
                        ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
                        : t === 'EXPENSE'
                          ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  )}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />

          <Input
            label="From"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />

          <Input
            label="To"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />

          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleApply} className="flex-1">
              Apply
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3 h-3" />}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <button
              onClick={() => removeFilter('type')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--bg-border)] hover:border-[var(--bg-border-bright)] transition-colors"
            >
              Type: {filters.type} <X className="w-3 h-3" />
            </button>
          )}
          {filters.category && (
            <button
              onClick={() => removeFilter('category')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--bg-border)] hover:border-[var(--bg-border-bright)] transition-colors"
            >
              Category: {filters.category} <X className="w-3 h-3" />
            </button>
          )}
          {filters.from && (
            <button
              onClick={() => removeFilter('from')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--bg-border)] hover:border-[var(--bg-border-bright)] transition-colors"
            >
              From: {filters.from} <X className="w-3 h-3" />
            </button>
          )}
          {filters.to && (
            <button
              onClick={() => removeFilter('to')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--bg-border)] hover:border-[var(--bg-border-bright)] transition-colors"
            >
              To: {filters.to} <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
