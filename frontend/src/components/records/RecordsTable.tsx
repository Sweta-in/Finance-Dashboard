import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RecordResponse } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Badge, typeBadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteRecord } from '../../hooks/useRecords';

interface RecordsTableProps {
  records: RecordResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  onPageChange: (page: number) => void;
  onReset?: () => void;
}

export function RecordsTable({
  records,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  hasNext,
  hasPrevious,
  pageSize,
  onPageChange,
  onReset,
}: RecordsTableProps) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);
  const navigate = useNavigate();
  const deleteRecord = useDeleteRecord();
  const [deleteTarget, setDeleteTarget] = useState<RecordResponse | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteRecord.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--bg-border)]">
          <div className="grid grid-cols-8 gap-4 text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider">
            <span>#</span>
            <span>TXN Ref</span>
            <span>Date</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span>Notes</span>
            <span>Created By</span>
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg">
        <EmptyState
          title="No records found"
          message="There are no financial records matching your filters. Try adjusting your criteria."
          actionLabel={onReset ? 'Reset Filters' : undefined}
          onAction={onReset}
        />
      </div>
    );
  }

  const startNum = currentPage * pageSize + 1;
  const endNum = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <>
      <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--bg-border)]">
          <div
            className={cn(
              'grid gap-4 text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider',
              isAdmin ? 'grid-cols-9' : 'grid-cols-8'
            )}
          >
            <span>#</span>
            <span>TXN Ref</span>
            <span>Date</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span>Notes</span>
            <span>Created By</span>
            {isAdmin && <span className="text-right">Actions</span>}
          </div>
        </div>

        {/* Rows */}
        {records.map((record, i) => (
          <div
            key={record.id}
            className={cn(
              'grid gap-4 px-4 py-3 items-center transition-colors hover:bg-[var(--bg-elevated)]/50 border-b border-[var(--bg-border)] last:border-b-0',
              isAdmin ? 'grid-cols-9' : 'grid-cols-8',
              i % 2 === 1 && 'bg-[var(--bg-base)]/30'
            )}
          >
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {currentPage * pageSize + i + 1}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] truncate" title={record.transactionRef}>
              {record.transactionRef}
            </span>
            <span className="text-xs font-body text-[var(--text-secondary)]">
              {formatDate(record.recordDate)}
            </span>
            <span className="text-xs font-body text-[var(--text-primary)]">
              {record.category}
            </span>
            <div>
              <Badge variant={typeBadgeVariant(record.type)}>{record.type}</Badge>
            </div>
            <span
              className={cn(
                'text-sm font-mono font-semibold text-right',
                record.type === 'INCOME'
                  ? 'text-[var(--accent-green)]'
                  : 'text-[var(--accent-red)]'
              )}
              style={{
                textShadow:
                  record.type === 'INCOME'
                    ? '0 0 10px rgba(0,229,160,0.2)'
                    : '0 0 10px rgba(255,59,92,0.2)',
              }}
            >
              {record.type === 'INCOME' ? '+' : '-'}
              {formatINR(record.amount)}
            </span>
            <span className="text-xs font-body text-[var(--text-secondary)] truncate" title={record.notes}>
              {record.notes || '—'}
            </span>
            <span className="text-xs font-body text-[var(--text-secondary)] truncate" title={record.createdBy?.name}>
              {record.createdBy?.name || '—'}
            </span>
            {isAdmin && (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => navigate(`/records/${record.id}/edit`)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(record)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-body text-[var(--text-secondary)]">
          Showing {startNum}–{endNum} of {totalElements} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            onClick={() => onPageChange(currentPage - 1)}
            icon={<ChevronLeft className="w-3 h-3" />}
          >
            Prev
          </Button>
          <span className="text-xs font-mono text-[var(--text-secondary)] px-3">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-[var(--text-secondary)]">
            Are you sure you want to delete this record?
          </p>
          {deleteTarget && (
            <div className="bg-[var(--bg-base)] rounded-lg p-3 border border-[var(--bg-border)]">
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {deleteTarget.transactionRef}
              </p>
              <p className="text-sm font-body text-[var(--text-primary)] mt-1">
                {deleteTarget.category} ·{' '}
                <span
                  className={cn(
                    'font-mono font-semibold',
                    deleteTarget.type === 'INCOME'
                      ? 'text-[var(--accent-green)]'
                      : 'text-[var(--accent-red)]'
                  )}
                >
                  {formatINR(deleteTarget.amount)}
                </span>
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteRecord.isPending}
              onClick={handleDelete}
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
