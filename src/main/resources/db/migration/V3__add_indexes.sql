CREATE INDEX idx_records_type       ON financial_records(type);
CREATE INDEX idx_records_category   ON financial_records(category);
CREATE INDEX idx_records_date       ON financial_records(record_date);
CREATE INDEX idx_records_deleted    ON financial_records(is_deleted);
CREATE INDEX idx_records_created_by ON financial_records(created_by);
CREATE INDEX idx_records_date_type  ON financial_records(record_date, type);
