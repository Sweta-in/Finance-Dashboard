import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRecordsList } from '../hooks/useRecords';
import { RecordFilters } from '../components/records/RecordFilters';
import { RecordsTable } from '../components/records/RecordsTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import type { RecordType } from '../types';

interface Filters {
  type: RecordType | '';
  category: string;
  from: string;
  to: string;
}

export default function Records() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole(['ADMIN']);

  const [filters, setFilters] = useState<Filters>({
    type: '',
    category: '',
    from: '',
    to: '',
  });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isError, refetch } = useRecordsList({
    type: filters.type || undefined,
    category: filters.category || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    size: pageSize,
    sort: 'recordDate,desc',
  });

  function handleApplyFilters(newFilters: Filters) {
    setFilters(newFilters);
    setPage(0);
  }

  function handleResetFilters() {
    setFilters({ type: '', category: '', from: '', to: '' });
    setPage(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Financial Records
          </h1>
          {data && (
            <Badge variant="default">{data.totalElements} records</Badge>
          )}
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/records/new')}
          >
            New Record
          </Button>
        )}
      </div>

      {/* Filters */}
      <RecordFilters onApply={handleApplyFilters} onReset={handleResetFilters} />

      {/* Error State */}
      {isError ? (
        <ErrorState
          title="Failed to load records"
          message="Financial records could not be retrieved. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : (
        /* Table */
        <RecordsTable
          records={data?.data || []}
          isLoading={isLoading}
          currentPage={data?.currentPage || 0}
          totalPages={data?.totalPages || 0}
          totalElements={data?.totalElements || 0}
          hasNext={data?.hasNext || false}
          hasPrevious={data?.hasPrevious || false}
          pageSize={pageSize}
          onPageChange={setPage}
          onReset={handleResetFilters}
        />
      )}
    </motion.div>
  );
}
