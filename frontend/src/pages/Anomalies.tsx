import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Radar,
  CheckCircle2,
} from 'lucide-react';
import { useAnomalies } from '../hooks/useAnomalies';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';
import type { AnomalyType } from '../types';

// ── Helpers ─────────────────────────────────────────────────────

function severityColor(score: number): string {
  if (score >= 0.8) return 'var(--accent-red)';
  if (score >= 0.5) return 'var(--accent-orange)';
  return 'var(--accent-purple)';
}

function typeLabel(type: AnomalyType): string {
  return type === 'HIGH_AMOUNT' ? 'High Amount' : 'Sudden Spike';
}

function typeDotColor(type: AnomalyType): string {
  return type === 'HIGH_AMOUNT' ? 'var(--accent-red)' : 'var(--accent-orange)';
}

function typeBadgeClasses(type: AnomalyType): string {
  return type === 'HIGH_AMOUNT'
    ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30'
    : 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-[var(--accent-orange)]/30';
}

// ── Component ───────────────────────────────────────────────────

export default function Anomalies() {
  const [typeFilter, setTypeFilter] = useState<AnomalyType | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, isError, refetch } = useAnomalies(
    typeFilter || undefined,
    fromDate || undefined,
    toDate || undefined
  );

  const anomalies = data ?? [];

  // Summary stats
  const totalCount = anomalies.length;
  const highAmountCount = useMemo(
    () => anomalies.filter((a) => a.anomalyType === 'HIGH_AMOUNT').length,
    [anomalies]
  );
  const suddenSpikeCount = useMemo(
    () => anomalies.filter((a) => a.anomalyType === 'SUDDEN_SPIKE').length,
    [anomalies]
  );

  // ── Stat cards data ───────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Anomalies Detected',
      value: totalCount,
      icon: <Activity className="w-5 h-5" />,
      color: 'var(--accent-purple)',
    },
    {
      label: 'High Amount Flags',
      value: highAmountCount,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'var(--accent-red)',
    },
    {
      label: 'Sudden Spike Flags',
      value: suddenSpikeCount,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'var(--accent-orange)',
    },
  ];

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
            Anomaly Detection
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-body mt-1">
            Flagged transactions based on statistical analysis
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Radar className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Scan Now
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

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-full sm:w-48">
            <Select
              label="Anomaly Type"
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as AnomalyType | '')
              }
              options={[
                { value: 'HIGH_AMOUNT', label: 'High Amount' },
                { value: 'SUDDEN_SPIKE', label: 'Sudden Spike' },
              ]}
            />
          </div>
          <div className="w-full sm:w-44">
            <Input
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Input
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="text-xs font-body text-[var(--text-muted)] whitespace-nowrap pb-1">
            {isLoading ? '...' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
          </div>
        </div>
      </Card>

      {/* ── Anomaly Cards List ───────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-48" />
                <div className="ml-auto">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-3 w-64" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-2 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load anomalies"
          message="Anomaly data could not be retrieved. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : anomalies.length === 0 ? (
        /* ── Empty State ──────────────────────────────────────────── */
        <EmptyState
          title="No anomalies detected in this period"
          message="Your finances look healthy. All transactions are within expected patterns."
          icon={
            <CheckCircle2 className="w-7 h-7 text-[var(--accent-green)]" />
          }
        />
      ) : (
        /* ── Anomaly Card Rows ────────────────────────────────────── */
        <div className="space-y-3">
          {anomalies.map((item, i) => (
            <motion.div
              key={`${item.recordId}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card hover padding="none">
                <div className="flex">
                  {/* Accent bar */}
                  <div
                    className="w-1 rounded-l-lg shrink-0"
                    style={{ backgroundColor: typeDotColor(item.anomalyType) }}
                  />
                  <div className="flex-1 p-5">
                    {/* Row 1: Severity dot + description + type badge + amount */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Severity dot */}
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: typeDotColor(item.anomalyType),
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-body font-medium text-[var(--text-primary)] truncate">
                            Record #{item.recordId}
                          </p>
                          <p className="text-xs font-body text-[var(--text-secondary)] mt-0.5">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Type badge pill */}
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-body border',
                            typeBadgeClasses(item.anomalyType)
                          )}
                        >
                          {typeLabel(item.anomalyType)}
                        </span>

                        {/* Amount */}
                        <span className="text-lg font-mono font-bold text-[var(--accent-red)]">
                          {formatINR(item.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Severity progress bar */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                        Severity
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round(item.severityScore * 100)}%`,
                          }}
                          transition={{ duration: 0.6, delay: i * 0.04 + 0.2 }}
                          style={{
                            backgroundColor: severityColor(item.severityScore),
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold shrink-0"
                        style={{
                          color: severityColor(item.severityScore),
                        }}
                      >
                        {Math.round(item.severityScore * 100)}%
                      </span>
                    </div>

                    {/* Row 3: Description */}
                    <p className="text-xs font-body text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
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
