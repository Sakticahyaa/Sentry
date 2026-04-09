-- =============================================
-- HYKE TODO — SUPABASE DATABASE SCHEMA
-- =============================================

-- ENUM values (handled via CHECK constraints in Supabase):
-- branch: 'Meroket', 'Thesis', 'Yutaka', 'Roetix', 'Batin', 'Hyke'
-- status: 'Not Yet', 'Ongoing', 'Done'
-- time_block: 'Q1','Q2','Q3','Q4','Q5','Q6','H0','H1','H2','H3'
-- priority: integer 1-5 (1 = highest/critical)

CREATE TABLE tasks (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT          NOT NULL,
  branch        TEXT          CHECK (branch IN ('Meroket', 'Thesis', 'Yutaka', 'Roetix', 'Batin', 'Hyke')),
  -- branch is nullable: when a branch is deleted, tasks keep existing but branch becomes NULL
  deadline      DATE,
  priority      INTEGER       DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status        TEXT          DEFAULT 'Not Yet' CHECK (status IN ('Not Yet', 'Ongoing', 'Done')),
  notes         TEXT,
  assigned_date DATE,         -- when user plans to work on it
  estimated_time FLOAT,       -- hours, e.g. 1.5
  time_block    TEXT          CHECK (time_block IN ('Q1','Q2','Q3','Q4','Q5','Q6','H0','H1','H2','H3')),
  "order"       INTEGER       DEFAULT 0,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do full CRUD
CREATE POLICY "Authenticated full access"
  ON tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- TIME BLOCK REFERENCE (not stored in DB)
-- =============================================
-- Q1 = 06:00–09:00
-- Q2 = 09:00–12:00
-- Q3 = 12:00–15:00
-- Q4 = 15:00–18:00
-- Q5 = 18:00–21:00
-- Q6 = 21:00–00:00
-- H0 = 00:00–06:00  (night/early)
-- H1 = Q1+Q2 = 06:00–12:00 (morning)
-- H2 = Q3+Q4 = 12:00–18:00 (afternoon)
-- H3 = Q5+Q6 = 18:00–00:00 (evening)

-- =============================================
-- PRIORITY REFERENCE (not stored in DB)
-- =============================================
-- 1 = Critical  🔴
-- 2 = High      🟠
-- 3 = Medium    🟡
-- 4 = Low       🔵
-- 5 = Optional  ⚪
