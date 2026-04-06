ALTER TABLE financial_records
ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS idx_records_transaction_ref
ON financial_records(transaction_ref)
WHERE transaction_ref IS NOT NULL;
