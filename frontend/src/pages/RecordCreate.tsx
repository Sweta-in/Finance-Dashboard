import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RecordForm } from '../components/records/RecordForm';
import { useCreateRecord } from '../hooks/useRecords';
import type { CreateRecordData } from '../types';

export default function RecordCreate() {
  const navigate = useNavigate();
  const createRecord = useCreateRecord();

  function handleSubmit(data: CreateRecordData) {
    createRecord.mutate(data, {
      onSuccess: () => navigate('/records'),
    });
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
          New Record
        </h1>
        <p className="text-sm font-body text-[var(--text-secondary)] mt-1">
          Create a new financial entry
        </p>
      </div>

      <RecordForm
        onSubmit={handleSubmit}
        isLoading={createRecord.isPending}
        submitLabel="Create Record"
      />
    </motion.div>
  );
}
