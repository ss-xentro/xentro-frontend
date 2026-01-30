ALTER TABLE "startups" ADD COLUMN "cover_image" varchar(512);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "funding_goal" numeric(16, 2);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "city" varchar(180);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "country" varchar(180);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "twitter" varchar(255);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "instagram" varchar(255);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "pitch_deck_url" varchar(512);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "demo_video_url" varchar(512);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "industry" varchar(120);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "sectors" json;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "sdg_focus" json;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "team_size" integer;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "employee_count" varchar(50);--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "highlights" json;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "media_features" json;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "profile_views" integer DEFAULT 0 NOT NULL;