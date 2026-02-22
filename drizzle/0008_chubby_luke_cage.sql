CREATE TYPE "public"."investor_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
ALTER TABLE "investor_profiles" ALTER COLUMN "type" SET DEFAULT 'angel';--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "firm_name" varchar(255);--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "investment_stages" json;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "check_size_min" numeric(16, 2);--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "check_size_max" numeric(16, 2);--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "sectors" json;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "portfolio_companies" json;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "notable_investments" json;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "deal_flow_preferences" text;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "linkedin_url" varchar(512);--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "status" "investor_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "rejected_reason" text;--> statement-breakpoint
ALTER TABLE "investor_profiles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "investor_profiles_user_idx" ON "investor_profiles" USING btree ("user_id");