-- Add institution_applications table
CREATE TABLE IF NOT EXISTS "institution_applications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(320) NOT NULL,
    "type" varchar(120) NOT NULL,
    "tagline" varchar(280),
    "city" varchar(180),
    "country" varchar(180),
    "website" varchar(255),
    "description" text,
    "logo" varchar(255),
    "status" varchar(32) DEFAULT 'pending' NOT NULL,
    "remark" text,
    "verification_token" varchar(255),
    "verified" boolean DEFAULT false NOT NULL,
    "institution_id" uuid,
    "applicant_user_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "institution_applications" ADD CONSTRAINT "institution_applications_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL;
ALTER TABLE "institution_applications" ADD CONSTRAINT "institution_applications_applicant_user_id_fkey" FOREIGN KEY ("applicant_user_id") REFERENCES "users"("id") ON DELETE SET NULL;
