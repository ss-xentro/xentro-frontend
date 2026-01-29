-- Add SDG and sector focus fields to institutions table
ALTER TABLE "institutions" ADD COLUMN IF NOT EXISTS "sdg_focus" json;
ALTER TABLE "institutions" ADD COLUMN IF NOT EXISTS "sector_focus" json;

-- Add additional fields to institution_applications table
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "sdg_focus" json;
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "sector_focus" json;
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "operating_mode" varchar(50);
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "country_code" varchar(4);
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "startups_supported" integer DEFAULT 0;
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "students_mentored" integer DEFAULT 0;
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "funding_facilitated" numeric(16, 2) DEFAULT '0';
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "funding_currency" varchar(8);
ALTER TABLE "institution_applications" ADD COLUMN IF NOT EXISTS "linkedin" varchar(255);
