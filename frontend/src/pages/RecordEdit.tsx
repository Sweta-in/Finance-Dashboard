import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RecordForm } from '../components/records/RecordForm';
import { useRecordDetail, useUpdateRecord } from '../hooks/useRecords';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import type { CreateRecordData } from '../types';

export default function RecordEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading, isError } = useRecordDetail(id || '');
  const updateRecord = useUpdateRecord();

  if (isLoading) return <PageSpinner />;

  if (isError || !record) {
    return (
      <EmptyState
        title="Record not found"
        message="The record you're looking for doesn't exist or has been deleted."
        actionLabel="Back to Records"
        onAction={() => navigate('/records')}
      />
    );
  }

  function handleSubmit(data: CreateRecordData) {
    if (!id) return;
    updateRecord.mutate(
      { id, data },
      { onSuccess: () => navigate('/records') }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl"
    >
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
          Edit Record
        </h1>
        <p className="text-sm font-body text-[var(--text-secondary)] mt-1">
          Update financial entry details
        </p>
      </div>

      <RecordForm
        initialData={{
          amount: record.amount,
          type: record.type,
          category: record.category,
          recordDate: record.recordDate,
          notes: record.notes,
          transactionRef: record.transactionRef,
        }}
        onSubmit={handleSubmit}
        isLoading={updateRecord.isPending}
        submitLabel="Update Record"
        metadata={{
          createdBy: record.createdBy?.name,
          updatedAt: record.updatedAt,
        }}
      />
    </motion.div>
  );
}
