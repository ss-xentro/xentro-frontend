CREATE TYPE "public"."auth_provider" AS ENUM('credentials', 'google');--> statement-breakpoint
CREATE TYPE "public"."mentor_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'admin';--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'approver';--> statement-breakpoint
CREATE TABLE "approvers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"mobile" varchar(50),
	"employee_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_account_id" varchar(320) NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institution_applications" (
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
	"phone" varchar(50),
	"sdg_focus" json,
	"sector_focus" json,
	"operating_mode" varchar(50),
	"country_code" varchar(4),
	"startups_supported" integer DEFAULT 0,
	"students_mentored" integer DEFAULT 0,
	"funding_facilitated" numeric(16, 2) DEFAULT '0',
	"funding_currency" varchar(8),
	"linkedin" varchar(255),
	"legal_documents" json,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"remark" text,
	"verification_token" varchar(255),
	"verified" boolean DEFAULT false NOT NULL,
	"institution_id" uuid,
	"applicant_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "institution_applications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "institution_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"otp" varchar(10) NOT NULL,
	"institution_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "email" varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "sdg_focus" json;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "sector_focus" json;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "legal_documents" json;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "status" "mentor_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "occupation" varchar(255);--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "packages" text;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "achievements" text;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "availability" text;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD COLUMN "rejected_reason" text;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institution_applications" ADD CONSTRAINT "institution_applications_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institution_applications" ADD CONSTRAINT "institution_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institution_sessions" ADD CONSTRAINT "institution_sessions_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "approvers_email_idx" ON "approvers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "approvers_employee_id_idx" ON "approvers" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_provider_account_idx" ON "auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_email_unique" UNIQUE("email");