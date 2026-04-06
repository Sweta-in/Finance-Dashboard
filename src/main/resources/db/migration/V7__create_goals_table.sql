-- =========================================================================
-- V7: Create goals table for savings goal tracking
-- =========================================================================

CREATE TABLE goals (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    icon            VARCHAR(50),
    target_amount   DOUBLE PRECISION NOT NULL,
    saved_amount    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    deadline        DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    user_id         UUID            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_goals_status
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED')),

    CONSTRAINT chk_goals_target_positive
        CHECK (target_amount > 0),

    CONSTRAINT chk_goals_saved_non_negative
        CHECK (saved_amount >= 0)
);

-- Index for fast user-scoped lookups ordered by creation date
CREATE INDEX idx_goals_user_id_created ON goals (user_id, created_at DESC);

-- Index for filtering by status
CREATE INDEX idx_goals_status ON goals (status);
