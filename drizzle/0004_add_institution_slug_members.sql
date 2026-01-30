-- Add slug field to institutions (unique URL identifier)
ALTER TABLE "institutions" ADD COLUMN IF NOT EXISTS "slug" varchar(100);
ALTER TABLE "institutions" ADD COLUMN IF NOT EXISTS "profile_views" integer DEFAULT 0 NOT NULL;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS "institutions_slug_idx" ON "institutions" ("slug");

-- Create index for status queries
CREATE INDEX IF NOT EXISTS "institutions_status_idx" ON "institutions" ("status");

-- Add institution_role enum
DO $$ BEGIN
    CREATE TYPE "institution_role" AS ENUM('owner', 'admin', 'manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update auth_provider enum to include 'otp'
ALTER TYPE "auth_provider" ADD VALUE IF NOT EXISTS 'otp';

-- Create institution_members table for team management
CREATE TABLE IF NOT EXISTS "institution_members" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "institution_id" uuid NOT NULL REFERENCES "institutions"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role" "institution_role" DEFAULT 'viewer' NOT NULL,
    "invited_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "invited_at" timestamp with time zone DEFAULT now() NOT NULL,
    "accepted_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create unique constraint for institution_members
CREATE UNIQUE INDEX IF NOT EXISTS "institution_member_unique" ON "institution_members" ("institution_id", "user_id");
CREATE INDEX IF NOT EXISTS "institution_members_institution_idx" ON "institution_members" ("institution_id");

-- Generate slugs for existing institutions that don't have one
UPDATE "institutions" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^\w\s-]', '', 'g'), '[\s_-]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Handle any duplicate slugs by appending ID suffix
WITH duplicates AS (
    SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "created_at") as rn
    FROM "institutions"
    WHERE "slug" IS NOT NULL
)
UPDATE "institutions" i
SET "slug" = i."slug" || '-' || SUBSTRING(CAST(i."id" AS varchar), 1, 8)
FROM duplicates d
WHERE i."id" = d."id" AND d.rn > 1;

-- Make slug NOT NULL after populating existing records
ALTER TABLE "institutions" ALTER COLUMN "slug" SET NOT NULL;
