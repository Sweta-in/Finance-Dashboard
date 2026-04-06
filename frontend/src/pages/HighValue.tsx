import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { useHighValueTransactions } from '../hooks/useDashboard';
import { Card } from '../components/ui/Card';
import { Badge, typeBadgeVariant } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';
import type { RecordType } from '../types';

export default function HighValue() {
  const [threshold, setThreshold] = useState(50000);
  const [type, setType] = useState<RecordType>('EXPENSE');
  const [debouncedThreshold, setDebouncedThreshold] = useState(50000);

  // Debounce threshold changes
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedThreshold(threshold), 500);
    return () => clearTimeout(timer);
  }, [threshold]);

  const { data, isLoading, isError, refetch } = useHighValueTransactions(debouncedThreshold, type);

  // Sort by highest amount first
  const sorted = data ? [...data].sort((a, b) => b.amount - a.amount) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
          High-Value Transactions
        </h1>
        <div className="group relative">
          <Info className="w-4 h-4 text-[var(--text-muted)] cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] font-body invisible group-hover:visible shadow-xl z-50">
            Shows transactions that exceed the specified threshold amount. Useful for monitoring large financial movements.
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <Input
              label="Threshold Amount (₹)"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              icon={<span className="text-sm font-mono">₹</span>}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider">
              Type
            </label>
            <div className="flex rounded-lg border border-[var(--bg-border)] overflow-hidden">
              {(['INCOME', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'px-4 py-2.5 text-xs font-body font-medium transition-all',
                    type === t
                      ? t === 'INCOME'
                        ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
                        : 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]'
                      : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-body text-[var(--text-muted)]">
            {sorted.length} result{sorted.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load transactions"
          message="High-value transactions could not be retrieved. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          title={`No transactions above ${formatINR(debouncedThreshold)}`}
          message={`There are no ${type.toLowerCase()} transactions exceeding the threshold.`}
          icon={<TrendingUpIcon className="w-7 h-7 text-[var(--text-muted)]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover padding="none">
                <div className="flex">
                  {/* Accent bar */}
                  <div
                    className={cn(
                      'w-1 rounded-l-lg shrink-0',
                      record.type === 'INCOME'
                        ? 'bg-[var(--accent-green)]'
                        : 'bg-[var(--accent-red)]'
                    )}
                  />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[11px] font-mono text-[var(--text-muted)]">
                          {record.transactionRef}
                        </p>
                        <p className="text-xs font-body text-[var(--text-secondary)] mt-0.5">
                          {formatDate(record.recordDate)}
                        </p>
                      </div>
                      <Badge variant={typeBadgeVariant(record.type)}>
                        {record.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-body text-[var(--text-primary)]">
                        {record.category}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'text-2xl font-mono font-bold',
                        record.type === 'INCOME'
                          ? 'text-[var(--accent-green)]'
                          : 'text-[var(--accent-red)]'
                      )}
                      style={{
                        textShadow:
                          record.type === 'INCOME'
                            ? '0 0 15px rgba(0,229,160,0.2)'
                            : '0 0 15px rgba(255,59,92,0.2)',
                      }}
                    >
                      {formatINR(record.amount)}
                    </p>

                    {record.createdBy && (
                      <p className="text-[11px] font-body text-[var(--text-muted)] mt-3">
                        Created by {record.createdBy.name}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
