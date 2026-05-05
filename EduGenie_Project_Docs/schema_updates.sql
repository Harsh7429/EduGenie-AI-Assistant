-- ============================================================
-- EduGenie — Schema Updates
-- Run these statements IN ORDER in your Neon SQL Editor.
-- All statements are safe to re-run (IF EXISTS / IF NOT EXISTS).
-- ============================================================


-- ── 1. quiz_attempts: add answers column (JSONB) ─────────────────────────────
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT NULL;


-- ── 2. topic_progress: create table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topic_progress (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id   INT NOT NULL,
    topic_id     INT NOT NULL,
    avg_score    DOUBLE PRECISION NOT NULL DEFAULT 0,
    attempts     INT NOT NULL DEFAULT 0,
    is_weak      BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_subject_topic UNIQUE (user_id, subject_id, topic_id)
);


-- ── 3. topic_progress: upgrade if table already existed ──────────────────────

-- 3a. Drop old unique constraint (user_id, topic_id) if it exists
ALTER TABLE topic_progress
DROP CONSTRAINT IF EXISTS unique_user_topic;

-- 3b. Add correct composite unique constraint if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_user_subject_topic'
    ) THEN
        ALTER TABLE topic_progress
        ADD CONSTRAINT unique_user_subject_topic
        UNIQUE (user_id, subject_id, topic_id);
    END IF;
END
$$;

-- 3c. Add is_weak column if missing
ALTER TABLE topic_progress
ADD COLUMN IF NOT EXISTS is_weak BOOLEAN DEFAULT FALSE;

-- 3d. Ensure avg_score is DOUBLE PRECISION
ALTER TABLE topic_progress
ALTER COLUMN avg_score TYPE DOUBLE PRECISION;
