CREATE TYPE "public"."admin_level" AS ENUM('L1', 'L2', 'L3');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."form_type" AS ENUM('startup_create', 'startup_update', 'mentor_apply', 'mentor_update', 'institute_create', 'institute_update', 'event_create', 'program_create', 'team_invite', 'general');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('appreciate', 'viewed', 'mentor_tip', 'saved');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('form_submitted', 'form_approved', 'form_rejected', 'form_changes_requested', 'context_unlocked', 'team_invite', 'team_invite_accepted', 'mentor_tip_received', 'appreciation_received', 'mention', 'system');--> statement-breakpoint
CREATE TYPE "public"."startup_role" AS ENUM('founder', 'co_founder', 'cto', 'coo', 'cfo', 'team_member');--> statement-breakpoint
CREATE TYPE "public"."user_context" AS ENUM('explorer', 'startup', 'mentor', 'institute', 'admin');--> statement-breakpoint
ALTER TYPE "public"."mentor_status" ADD VALUE 'suspended';--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"context" "user_context",
	"context_entity_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"details" json,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" "admin_level" NOT NULL,
	"permissions" json DEFAULT '[]'::json,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "interaction_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"image_url" varchar(512),
	"sectors" json DEFAULT '[]'::json,
	"stages" json DEFAULT '[]'::json,
	"created_by" uuid,
	"creator_type" varchar(50),
	"creator_id" uuid,
	"creator_name" varchar(255),
	"creator_logo" varchar(512),
	"view_count" integer DEFAULT 0 NOT NULL,
	"appreciation_count" integer DEFAULT 0 NOT NULL,
	"mentor_tip_count" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"previous_status" "form_status" NOT NULL,
	"new_status" "form_status" NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "form_type" NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"submitted_by" uuid NOT NULL,
	"submitted_at" timestamp with time zone,
	"data" json NOT NULL,
	"attachments" json DEFAULT '[]'::json,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"result_entity_type" varchar(50),
	"result_entity_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"action_url" varchar(512),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"otp" varchar(10) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feed_item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "startup_role" NOT NULL,
	"title" varchar(120),
	"invited_by" uuid,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar(512);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unlocked_contexts" json DEFAULT '["explorer"]'::json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_context" "user_context" DEFAULT 'explorer';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_interactions" ADD CONSTRAINT "feed_interactions_feed_item_id_feed_items_id_fk" FOREIGN KEY ("feed_item_id") REFERENCES "public"."feed_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_interactions" ADD CONSTRAINT "feed_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_reviews" ADD CONSTRAINT "form_reviews_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_reviews" ADD CONSTRAINT "form_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_feed_item_id_feed_items_id_fk" FOREIGN KEY ("feed_item_id") REFERENCES "public"."feed_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_members" ADD CONSTRAINT "startup_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_context_idx" ON "activity_logs" USING btree ("context","context_entity_id");--> statement-breakpoint
CREATE INDEX "activity_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_user_unique_idx" ON "admin_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "feed_interaction_unique_idx" ON "feed_interactions" USING btree ("feed_item_id","user_id","type");--> statement-breakpoint
CREATE INDEX "feed_interaction_item_idx" ON "feed_interactions" USING btree ("feed_item_id");--> statement-breakpoint
CREATE INDEX "feed_interaction_user_idx" ON "feed_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feed_source_idx" ON "feed_items" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "feed_score_idx" ON "feed_items" USING btree ("score");--> statement-breakpoint
CREATE INDEX "feed_created_at_idx" ON "feed_items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feed_creator_idx" ON "feed_items" USING btree ("creator_type","creator_id");--> statement-breakpoint
CREATE INDEX "form_reviews_form_idx" ON "form_reviews" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_reviews_reviewer_idx" ON "form_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "forms_type_idx" ON "forms" USING btree ("type");--> statement-breakpoint
CREATE INDEX "forms_status_idx" ON "forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "forms_submitted_by_idx" ON "forms" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "forms_type_status_idx" ON "forms" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "otp_email_purpose_idx" ON "otp_sessions" USING btree ("email","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_item_unique_idx" ON "saved_items" USING btree ("user_id","feed_item_id");--> statement-breakpoint
CREATE INDEX "saved_item_user_idx" ON "saved_items" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "startup_member_unique_idx" ON "startup_members" USING btree ("startup_id","user_id");--> statement-breakpoint
CREATE INDEX "startup_member_user_idx" ON "startup_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "startup_member_startup_idx" ON "startup_members" USING btree ("startup_id");