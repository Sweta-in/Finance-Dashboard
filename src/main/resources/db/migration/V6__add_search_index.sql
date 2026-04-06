-- Full-text search support for financial_records
-- Adds a tsvector column with GIN index for fast text search on notes + category

ALTER TABLE financial_records ADD COLUMN search_vector tsvector;

-- Populate existing rows
UPDATE financial_records
SET search_vector = to_tsvector('english', COALESCE(notes, '') || ' ' || COALESCE(category, ''));

-- GIN index for fast full-text search
CREATE INDEX idx_records_search_vector ON financial_records USING GIN (search_vector);

-- Trigger to auto-update search_vector on INSERT or UPDATE
CREATE OR REPLACE FUNCTION financial_records_search_trigger()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.notes, '') || ' ' || COALESCE(NEW.category, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_financial_records_search
    BEFORE INSERT OR UPDATE ON financial_records
    FOR EACH ROW
    EXECUTE FUNCTION financial_records_search_trigger();
