-- Add institution_id to startups to align with app requirements
ALTER TABLE "startups"
  ADD COLUMN IF NOT EXISTS "institution_id" uuid;

-- Keep owner_id column present (no-op if already there)
ALTER TABLE "startups"
  ADD COLUMN IF NOT EXISTS "owner_id" uuid;

-- Add FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_institution_id_fkey'
  ) THEN
    ALTER TABLE "startups"
      ADD CONSTRAINT "startups_institution_id_fkey"
      FOREIGN KEY ("institution_id")
      REFERENCES "institutions"("id")
      ON DELETE CASCADE;
  END IF;
END $$;

-- Index for efficient lookups by institution
CREATE INDEX IF NOT EXISTS "startups_institution_id_idx" ON "startups" ("institution_id");
