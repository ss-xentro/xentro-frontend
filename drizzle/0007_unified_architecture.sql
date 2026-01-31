-- Xentro Unified Architecture Migration
-- This migration implements the new unified user model with context-based dashboards

-- ============================================
-- ENUMS
-- ============================================

-- Drop old enums if they exist (for clean migration)
-- Note: In production, handle this more carefully

CREATE TYPE IF NOT EXISTS user_context AS ENUM ('explorer', 'startup', 'mentor', 'institute', 'admin');
CREATE TYPE IF NOT EXISTS form_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE IF NOT EXISTS form_type AS ENUM ('startup_create', 'startup_update', 'mentor_apply', 'mentor_update', 'institute_create', 'institute_update', 'event_create', 'program_create', 'team_invite', 'general');
CREATE TYPE IF NOT EXISTS admin_level AS ENUM ('L1', 'L2', 'L3');
CREATE TYPE IF NOT EXISTS startup_stage AS ENUM ('idea', 'mvp', 'early_traction', 'growth', 'scale');
CREATE TYPE IF NOT EXISTS startup_status AS ENUM ('active', 'stealth', 'paused', 'acquired', 'shut_down');
CREATE TYPE IF NOT EXISTS funding_round AS ENUM ('bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus');
CREATE TYPE IF NOT EXISTS startup_role AS ENUM ('founder', 'co_founder', 'cto', 'coo', 'cfo', 'team_member');
CREATE TYPE IF NOT EXISTS institute_role AS ENUM ('owner', 'admin', 'manager', 'viewer');
CREATE TYPE IF NOT EXISTS mentor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE IF NOT EXISTS interaction_type AS ENUM ('appreciate', 'viewed', 'mentor_tip', 'saved');
CREATE TYPE IF NOT EXISTS notification_type AS ENUM ('form_submitted', 'form_approved', 'form_rejected', 'team_invite', 'mention', 'system');
CREATE TYPE IF NOT EXISTS auth_provider AS ENUM ('google', 'credentials', 'otp');

-- ============================================
-- USERS (Core Identity)
-- ============================================

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS unlocked_contexts jsonb DEFAULT '["explorer"]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS active_context user_context DEFAULT 'explorer' NOT NULL,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS two_factor_secret varchar(255),
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS avatar varchar(512),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- ============================================
-- OTP SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS otp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(320) NOT NULL,
  otp varchar(10) NOT NULL,
  purpose varchar(50) NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS otp_email_purpose_idx ON otp_sessions(email, purpose);

-- ============================================
-- EXPLORER PROFILES (Update existing)
-- ============================================

ALTER TABLE explorer_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_sectors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_stages jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_views integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_appreciations integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- Convert interests to jsonb if it's text
-- ALTER TABLE explorer_profiles ALTER COLUMN interests TYPE jsonb USING interests::jsonb;

-- ============================================
-- MENTOR PROFILES (Update existing)
-- ============================================

ALTER TABLE mentor_profiles
ADD COLUMN IF NOT EXISTS headline varchar(280),
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS industries jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS company varchar(255),
ADD COLUMN IF NOT EXISTS linkedin_url varchar(512),
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2),
ADD COLUMN IF NOT EXISTS currency varchar(8) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS total_sessions integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_mentees integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rating numeric(3, 2),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- ============================================
-- ADMIN PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level admin_level NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_user_unique_idx ON admin_profiles(user_id);

-- ============================================
-- STARTUPS (Update existing)
-- ============================================

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS currency varchar(8) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS form_id uuid;

-- ============================================
-- STARTUP MEMBERS (Replace team_members & startup_founders)
-- ============================================

CREATE TABLE IF NOT EXISTS startup_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role startup_role NOT NULL,
  title varchar(120),
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  invited_at timestamptz DEFAULT now() NOT NULL,
  accepted_at timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS startup_member_unique_idx ON startup_members(startup_id, user_id);
CREATE INDEX IF NOT EXISTS startup_member_user_idx ON startup_members(user_id);
CREATE INDEX IF NOT EXISTS startup_member_startup_idx ON startup_members(startup_id);

-- ============================================
-- INSTITUTIONS (Update existing)
-- ============================================

ALTER TABLE institutions
ADD COLUMN IF NOT EXISTS cover_image varchar(512),
ADD COLUMN IF NOT EXISTS mentors_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS form_id uuid;

-- ============================================
-- INSTITUTION MEMBERS (Update existing)
-- ============================================

-- Already exists, just add any missing columns
ALTER TABLE institution_members
ADD COLUMN IF NOT EXISTS title varchar(120);

-- ============================================
-- FORMS ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type form_type NOT NULL,
  status form_status DEFAULT 'draft' NOT NULL,
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_at timestamptz,
  data jsonb NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  result_entity_type varchar(50),
  result_entity_id uuid,
  version integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS forms_type_idx ON forms(type);
CREATE INDEX IF NOT EXISTS forms_status_idx ON forms(status);
CREATE INDEX IF NOT EXISTS forms_submitted_by_idx ON forms(submitted_by);
CREATE INDEX IF NOT EXISTS forms_type_status_idx ON forms(type, status);

-- ============================================
-- FORM REVIEWS (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS form_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action varchar(50) NOT NULL,
  previous_status form_status NOT NULL,
  new_status form_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS form_reviews_form_idx ON form_reviews(form_id);
CREATE INDEX IF NOT EXISTS form_reviews_reviewer_idx ON form_reviews(reviewer_id);

-- ============================================
-- EVENTS (Update existing)
-- ============================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS startup_id uuid REFERENCES startups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS online_url varchar(512),
ADD COLUMN IF NOT EXISTS end_time timestamptz,
ADD COLUMN IF NOT EXISTS cover_image varchar(512),
ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS currency varchar(8) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS status varchar(32) DEFAULT 'draft' NOT NULL,
ADD COLUMN IF NOT EXISTS form_id uuid,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- ============================================
-- PROGRAMS (Update existing)
-- ============================================

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS application_deadline timestamptz,
ADD COLUMN IF NOT EXISTS max_participants integer,
ADD COLUMN IF NOT EXISTS form_id uuid,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now() NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- ============================================
-- FEED SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type varchar(50) NOT NULL,
  source_id uuid NOT NULL,
  title varchar(255) NOT NULL,
  summary text,
  image_url varchar(512),
  sectors jsonb DEFAULT '[]'::jsonb,
  stages jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  creator_type varchar(50),
  creator_id uuid,
  creator_name varchar(255),
  creator_logo varchar(512),
  view_count integer DEFAULT 0 NOT NULL,
  appreciation_count integer DEFAULT 0 NOT NULL,
  score integer DEFAULT 0 NOT NULL,
  is_public boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS feed_source_idx ON feed_items(source_type, source_id);
CREATE INDEX IF NOT EXISTS feed_score_idx ON feed_items(score);
CREATE INDEX IF NOT EXISTS feed_created_at_idx ON feed_items(created_at);
CREATE INDEX IF NOT EXISTS feed_creator_idx ON feed_items(creator_type, creator_id);

-- ============================================
-- FEED INTERACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS feed_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id uuid NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS feed_interaction_unique_idx ON feed_interactions(feed_item_id, user_id, type);
CREATE INDEX IF NOT EXISTS feed_interaction_item_idx ON feed_interactions(feed_item_id);
CREATE INDEX IF NOT EXISTS feed_interaction_user_idx ON feed_interactions(user_id);

-- ============================================
-- SAVED ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feed_item_id uuid NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS saved_item_unique_idx ON saved_items(user_id, feed_item_id);
CREATE INDEX IF NOT EXISTS saved_item_user_idx ON saved_items(user_id);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  context user_context,
  context_entity_id uuid,
  action varchar(100) NOT NULL,
  entity_type varchar(50),
  entity_id uuid,
  details jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS activity_user_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_context_idx ON activity_logs(context, context_entity_id);
CREATE INDEX IF NOT EXISTS activity_created_at_idx ON activity_logs(created_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title varchar(255) NOT NULL,
  message text,
  entity_type varchar(50),
  entity_id uuid,
  action_url varchar(512),
  is_read boolean DEFAULT false NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS notification_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notification_user_unread_idx ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS notification_created_at_idx ON notifications(created_at);

-- ============================================
-- MEDIA ASSETS (Update existing)
-- ============================================

ALTER TABLE media_assets
ADD COLUMN IF NOT EXISTS file_name varchar(255),
ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL;
