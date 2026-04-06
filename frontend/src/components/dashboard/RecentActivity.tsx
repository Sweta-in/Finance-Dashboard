import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { RecordResponse } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatRelative } from '../../utils/date';
import { Badge, typeBadgeVariant } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface RecentActivityProps {
  records: RecordResponse[];
}

const categoryColors: Record<string, string> = {
  Salary: '#0DAF6E',
  Freelance: '#2B6FE8',
  Consulting: '#7C4DDB',
  'Investment Return': '#D99515',
  'AWS EC2': '#E5364B',
  'RDS Storage': '#E67E22',
  'GitHub Actions': '#0097A7',
  'Razorpay Fee': '#C2185B',
  Default: '#5A6170',
};

function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.Default;
}

export function RecentActivity({ records }: RecentActivityProps) {
  return (
    <div className="space-y-1">
      {records.slice(0, 10).map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-default group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ backgroundColor: getCategoryColor(record.category) + '22' }}
            >
              <span style={{ color: getCategoryColor(record.category) }}>
                {record.category[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-body text-[var(--text-primary)] truncate">
                {record.category}
              </p>
              <p className="text-[11px] font-body text-[var(--text-muted)]">
                {formatRelative(record.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={cn(
                'text-sm font-mono font-semibold',
                record.type === 'INCOME'
                  ? 'text-[var(--accent-green)]'
                  : 'text-[var(--accent-red)]'
              )}
            >
              {record.type === 'INCOME' ? '+' : '-'}
              {formatINR(record.amount)}
            </span>
            <Badge variant={typeBadgeVariant(record.type)}>
              {record.type}
            </Badge>
          </div>
        </div>
      ))}

      <Link
        to="/records"
        className="flex items-center justify-center gap-2 py-3 text-xs font-body text-[var(--accent-blue)] hover:text-[var(--accent-blue)]/80 transition-colors"
      >
        View all records <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
