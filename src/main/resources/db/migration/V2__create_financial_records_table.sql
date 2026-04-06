CREATE TABLE financial_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    type        VARCHAR(10)   NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
    category    VARCHAR(100)  NOT NULL,
    record_date DATE          NOT NULL,
    notes       TEXT,
    created_by  UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT now(),
    version     BIGINT        NOT NULL DEFAULT 0
);
