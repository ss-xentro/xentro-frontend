/**
 * XENTRO UNIFIED SCHEMA
 * 
 * Architecture Principles:
 * - One email = one user (global identity)
 * - All users start as Explorer
 * - Roles (Founder, Mentor, Institute Admin) unlocked via actions
 * - Context-based dashboards, not account-based
 * - Forms Engine for all create/apply actions
 */

import { pgEnum, pgTable, uuid, varchar, timestamp, boolean, text, integer, numeric, uniqueIndex, json, index, primaryKey } from 'drizzle-orm/pg-core';

// ============================================
// ENUMS
// ============================================

// Auth providers
export const authProviderEnum = pgEnum('auth_provider', ['google', 'credentials', 'otp']);

// User contexts (not account types - these are dashboards they can access)
export const userContextEnum = pgEnum('user_context', [
  'explorer',      // Default for all users
  'startup',       // Founder or team member of a startup
  'mentor',        // Approved mentor
  'institute',     // Institute admin or member
  'admin'          // Platform admin (L1, L2, L3)
]);

// Form states - all actions go through forms
export const formStatusEnum = pgEnum('form_status', [
  'draft',         // User is still filling
  'submitted',     // Submitted for review
  'under_review',  // Being reviewed by admin
  'approved',      // Approved and processed
  'rejected',      // Rejected with feedback
  'withdrawn'      // Withdrawn by user
]);

// Form types - what kind of form this is
export const formTypeEnum = pgEnum('form_type', [
  'startup_create',        // Create a new startup
  'startup_update',        // Update startup info
  'mentor_apply',          // Apply to become mentor
  'mentor_update',         // Update mentor profile
  'institute_create',      // Create institution
  'institute_update',      // Update institution
  'event_create',          // Create an event
  'program_create',        // Create a program
  'team_invite',           // Invite team member
  'general'                // Generic form
]);

// Admin levels
export const adminLevelEnum = pgEnum('admin_level', ['L1', 'L2', 'L3']);

// Startup enums
export const startupStageEnum = pgEnum('startup_stage', ['idea', 'mvp', 'early_traction', 'growth', 'scale']);
export const startupStatusEnum = pgEnum('startup_status', ['active', 'stealth', 'paused', 'acquired', 'shut_down']);
export const fundingRoundEnum = pgEnum('funding_round', ['bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus']);

// Membership roles
export const startupRoleEnum = pgEnum('startup_role', ['founder', 'co_founder', 'cto', 'coo', 'cfo', 'team_member']);
export const instituteRoleEnum = pgEnum('institute_role', ['owner', 'admin', 'manager', 'viewer']);
export const mentorStatusEnum = pgEnum('mentor_status', ['pending', 'approved', 'rejected', 'suspended']);

// Feed interaction types
export const interactionTypeEnum = pgEnum('interaction_type', ['appreciate', 'viewed', 'mentor_tip', 'saved']);

// Notification types
export const notificationTypeEnum = pgEnum('notification_type', [
  'form_submitted',
  'form_approved', 
  'form_rejected',
  'team_invite',
  'mention',
  'system'
]);

// ============================================
// CORE IDENTITY (Single Source of Truth)
// ============================================

/**
 * users - Global identity table
 * One email = one user, period.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  avatar: varchar('avatar', { length: 512 }),
  
  // What contexts this user has unlocked
  unlockedContexts: json('unlocked_contexts').$type<string[]>().default(['explorer']).notNull(),
  
  // Current active context (for JWT scoping)
  activeContext: userContextEnum('active_context').default('explorer').notNull(),
  
  // 2FA enabled (required for admin roles)
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  
  // Account status
  emailVerified: boolean('email_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
}, (table) => ({
  emailUnique: uniqueIndex('users_email_unique_idx').on(table.email),
}));

/**
 * auth_accounts - Multiple auth methods per user
 * User can have Google + Password + OTP all linked
 */
export const authAccounts = pgTable('auth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: authProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 320 }).notNull(),
  passwordHash: text('password_hash'), // Only for credentials provider
  refreshToken: text('refresh_token'), // For OAuth providers
  accessToken: text('access_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerUnique: uniqueIndex('auth_provider_account_idx').on(table.provider, table.providerAccountId),
  userProviderUnique: uniqueIndex('auth_user_provider_idx').on(table.userId, table.provider),
}));

/**
 * otp_sessions - Temporary OTP storage
 */
export const otpSessions = pgTable('otp_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'login', 'verify_email', 'reset_password'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailPurposeIdx: index('otp_email_purpose_idx').on(table.email, table.purpose),
}));

// ============================================
// PROFILES (Context-specific data)
// ============================================

/**
 * explorer_profiles - Default profile for all users
 * Created automatically on signup
 */
export const explorerProfiles = pgTable('explorer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  bio: text('bio'),
  educationLevel: varchar('education_level', { length: 100 }),
  interests: json('interests').$type<string[]>().default([]),
  skills: json('skills').$type<string[]>().default([]),
  
  // Preferences for feed ranking
  preferredSectors: json('preferred_sectors').$type<string[]>().default([]),
  preferredStages: json('preferred_stages').$type<string[]>().default([]),
  
  // Engagement metrics
  totalViews: integer('total_views').default(0).notNull(),
  totalAppreciations: integer('total_appreciations').default(0).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex('explorer_user_unique_idx').on(table.userId),
}));

/**
 * mentor_profiles - Unlocked via mentor_apply form approval
 */
export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Status (controlled by approval system)
  status: mentorStatusEnum('status').default('pending').notNull(),
  
  // Profile info
  headline: varchar('headline', { length: 280 }),
  bio: text('bio'),
  expertise: json('expertise').$type<string[]>().default([]),
  industries: json('industries').$type<string[]>().default([]),
  
  // Credentials
  occupation: varchar('occupation', { length: 255 }),
  company: varchar('company', { length: 255 }),
  linkedinUrl: varchar('linkedin_url', { length: 512 }),
  yearsExperience: integer('years_experience'),
  
  // Mentor-specific
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 8 }).default('USD'),
  availability: json('availability').$type<Record<string, boolean>>(), // Day availability map
  
  // Metrics
  totalSessions: integer('total_sessions').default(0).notNull(),
  totalMentees: integer('total_mentees').default(0).notNull(),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  
  // Approval tracking
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  rejectedReason: text('rejected_reason'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex('mentor_user_unique_idx').on(table.userId),
  statusIdx: index('mentor_status_idx').on(table.status),
}));

/**
 * admin_profiles - Platform admins (L1, L2, L3)
 */
export const adminProfiles = pgTable('admin_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  level: adminLevelEnum('level').notNull(),
  permissions: json('permissions').$type<string[]>().default([]),
  
  // For accountability
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userUnique: uniqueIndex('admin_user_unique_idx').on(table.userId),
}));

// ============================================
// STARTUPS
// ============================================

/**
 * startups - Created via startup_create form approval
 */
export const startups = pgTable('startups', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull(),
  
  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 280 }),
  pitch: varchar('pitch', { length: 500 }),
  description: text('description'),
  
  // Visual
  logo: varchar('logo', { length: 512 }),
  coverImage: varchar('cover_image', { length: 512 }),
  
  // Status
  stage: startupStageEnum('stage').default('idea').notNull(),
  status: startupStatusEnum('status').default('active').notNull(),
  
  // Location
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  
  // Funding
  fundingRound: fundingRoundEnum('funding_round').default('bootstrapped'),
  fundsRaised: numeric('funds_raised', { precision: 16, scale: 2 }),
  fundingGoal: numeric('funding_goal', { precision: 16, scale: 2 }),
  currency: varchar('currency', { length: 8 }).default('USD'),
  
  // Focus areas
  sectors: json('sectors').$type<string[]>().default([]),
  sdgFocus: json('sdg_focus').$type<string[]>().default([]),
  
  // Links
  website: varchar('website', { length: 512 }),
  linkedin: varchar('linkedin', { length: 512 }),
  twitter: varchar('twitter', { length: 512 }),
  pitchDeckUrl: varchar('pitch_deck_url', { length: 512 }),
  demoVideoUrl: varchar('demo_video_url', { length: 512 }),
  
  // Metrics
  teamSize: integer('team_size').default(1),
  profileViews: integer('profile_views').default(0).notNull(),
  
  // Relations
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  
  // Approval tracking (from form)
  formId: uuid('form_id'), // Reference to the form that created this
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugUnique: uniqueIndex('startups_slug_unique_idx').on(table.slug),
  statusIdx: index('startups_status_idx').on(table.status),
  stageIdx: index('startups_stage_idx').on(table.stage),
}));

/**
 * startup_members - Users who have startup context access
 */
export const startupMembers = pgTable('startup_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  role: startupRoleEnum('role').notNull(),
  title: varchar('title', { length: 120 }), // Custom title like "Head of Marketing"
  
  // Invite tracking
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('startup_member_unique_idx').on(table.startupId, table.userId),
  userIdx: index('startup_member_user_idx').on(table.userId),
  startupIdx: index('startup_member_startup_idx').on(table.startupId),
}));

// ============================================
// INSTITUTIONS
// ============================================

/**
 * institutions - Created via institute_create form approval
 */
export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull(),
  
  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(), // incubator, accelerator, university, etc.
  tagline: varchar('tagline', { length: 280 }),
  description: text('description'),
  
  // Visual
  logo: varchar('logo', { length: 512 }),
  coverImage: varchar('cover_image', { length: 512 }),
  
  // Location
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  operatingMode: varchar('operating_mode', { length: 50 }), // local, national, global
  
  // Contact
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 512 }),
  linkedin: varchar('linkedin', { length: 512 }),
  
  // Focus areas
  sectorFocus: json('sector_focus').$type<string[]>().default([]),
  sdgFocus: json('sdg_focus').$type<string[]>().default([]),
  
  // Metrics
  startupsSupported: integer('startups_supported').default(0).notNull(),
  mentorsCount: integer('mentors_count').default(0).notNull(),
  fundingFacilitated: numeric('funding_facilitated', { precision: 16, scale: 2 }).default('0'),
  profileViews: integer('profile_views').default(0).notNull(),
  
  // Status
  status: varchar('status', { length: 32 }).default('draft').notNull(),
  verified: boolean('verified').default(false).notNull(),
  
  // Approval tracking
  formId: uuid('form_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugUnique: uniqueIndex('institutions_slug_unique_idx').on(table.slug),
  emailUnique: uniqueIndex('institutions_email_unique_idx').on(table.email),
  statusIdx: index('institutions_status_idx').on(table.status),
}));

/**
 * institution_members - Users who have institute context access
 */
export const institutionMembers = pgTable('institution_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  role: instituteRoleEnum('role').notNull(),
  title: varchar('title', { length: 120 }),
  
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('institution_member_unique_idx').on(table.institutionId, table.userId),
  userIdx: index('institution_member_user_idx').on(table.userId),
  institutionIdx: index('institution_member_institution_idx').on(table.institutionId),
}));

// ============================================
// FORMS ENGINE
// ============================================

/**
 * forms - Universal form submissions
 * ALL create/apply actions go through this
 */
export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // What kind of form
  type: formTypeEnum('type').notNull(),
  
  // Status workflow
  status: formStatusEnum('status').default('draft').notNull(),
  
  // Who submitted
  submittedBy: uuid('submitted_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  
  // Form data (flexible JSON for different form types)
  data: json('data').$type<Record<string, unknown>>().notNull(),
  
  // Files attached to this form
  attachments: json('attachments').$type<{ name: string; url: string; type: string }[]>().default([]),
  
  // Review info
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  
  // For linking to created entity after approval
  resultEntityType: varchar('result_entity_type', { length: 50 }), // 'startup', 'mentor', 'institution', etc.
  resultEntityId: uuid('result_entity_id'),
  
  // Versioning for edits
  version: integer('version').default(1).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('forms_type_idx').on(table.type),
  statusIdx: index('forms_status_idx').on(table.status),
  submittedByIdx: index('forms_submitted_by_idx').on(table.submittedBy),
  typeStatusIdx: index('forms_type_status_idx').on(table.type, table.status),
}));

/**
 * form_reviews - Audit trail for all form reviews
 */
export const formReviews = pgTable('form_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  
  // Who reviewed
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  
  // What action
  action: varchar('action', { length: 50 }).notNull(), // 'approve', 'reject', 'request_changes', 'escalate'
  
  // Status before and after
  previousStatus: formStatusEnum('previous_status').notNull(),
  newStatus: formStatusEnum('new_status').notNull(),
  
  // Notes
  notes: text('notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  formIdx: index('form_reviews_form_idx').on(table.formId),
  reviewerIdx: index('form_reviews_reviewer_idx').on(table.reviewerId),
}));

// ============================================
// EVENTS & PROGRAMS
// ============================================

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Can be created by institution or startup
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  
  // Event details
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 120 }),
  
  // Location & time
  location: varchar('location', { length: 255 }),
  isOnline: boolean('is_online').default(false).notNull(),
  onlineUrl: varchar('online_url', { length: 512 }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  
  // Visual
  coverImage: varchar('cover_image', { length: 512 }),
  
  // Pricing
  isFree: boolean('is_free').default(true).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 8 }).default('USD'),
  
  // Status (via form approval)
  status: varchar('status', { length: 32 }).default('draft').notNull(),
  formId: uuid('form_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index('events_institution_idx').on(table.institutionId),
  startupIdx: index('events_startup_idx').on(table.startupId),
  statusIdx: index('events_status_idx').on(table.status),
  startTimeIdx: index('events_start_time_idx').on(table.startTime),
}));

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(), // cohort, bootcamp, accelerator, etc.
  description: text('description'),
  
  // Duration
  duration: varchar('duration', { length: 120 }),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  
  // Application
  applicationDeadline: timestamp('application_deadline', { withTimezone: true }),
  maxParticipants: integer('max_participants'),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  formId: uuid('form_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index('programs_institution_idx').on(table.institutionId),
}));

// ============================================
// FEED SYSTEM
// ============================================

/**
 * feed_items - Denormalized feed entries
 * Built from form submissions & updates
 */
export const feedItems = pgTable('feed_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Source reference
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'startup', 'event', 'mentor', 'institution', 'program'
  sourceId: uuid('source_id').notNull(),
  
  // Denormalized content for fast rendering
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  imageUrl: varchar('image_url', { length: 512 }),
  
  // Categorization for ranking
  sectors: json('sectors').$type<string[]>().default([]),
  stages: json('stages').$type<string[]>().default([]),
  
  // Creator info
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  creatorType: varchar('creator_type', { length: 50 }), // 'startup', 'institution', 'mentor'
  creatorId: uuid('creator_id'),
  creatorName: varchar('creator_name', { length: 255 }),
  creatorLogo: varchar('creator_logo', { length: 512 }),
  
  // Engagement metrics
  viewCount: integer('view_count').default(0).notNull(),
  appreciationCount: integer('appreciation_count').default(0).notNull(),
  
  // For feed ranking
  score: integer('score').default(0).notNull(),
  
  // Visibility
  isPublic: boolean('is_public').default(true).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sourceIdx: index('feed_source_idx').on(table.sourceType, table.sourceId),
  scoreIdx: index('feed_score_idx').on(table.score),
  createdAtIdx: index('feed_created_at_idx').on(table.createdAt),
  creatorIdx: index('feed_creator_idx').on(table.creatorType, table.creatorId),
}));

/**
 * feed_interactions - User interactions with feed items
 */
export const feedInteractions = pgTable('feed_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  feedItemId: uuid('feed_item_id').references(() => feedItems.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: interactionTypeEnum('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueInteraction: uniqueIndex('feed_interaction_unique_idx').on(table.feedItemId, table.userId, table.type),
  feedItemIdx: index('feed_interaction_item_idx').on(table.feedItemId),
  userIdx: index('feed_interaction_user_idx').on(table.userId),
}));

/**
 * saved_items - User's saved feed items
 */
export const savedItems = pgTable('saved_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  feedItemId: uuid('feed_item_id').references(() => feedItems.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userItemUnique: uniqueIndex('saved_item_unique_idx').on(table.userId, table.feedItemId),
  userIdx: index('saved_item_user_idx').on(table.userId),
}));

// ============================================
// ACTIVITY & NOTIFICATIONS
// ============================================

/**
 * activity_logs - Comprehensive audit trail
 */
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Who did it
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // What context
  context: userContextEnum('context'),
  contextEntityId: uuid('context_entity_id'), // startup_id, institution_id, etc.
  
  // Action details
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  
  // Change details
  details: json('details').$type<Record<string, unknown>>(),
  
  // IP for security audits
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('activity_user_idx').on(table.userId),
  contextIdx: index('activity_context_idx').on(table.context, table.contextEntityId),
  createdAtIdx: index('activity_created_at_idx').on(table.createdAt),
}));

/**
 * notifications - User notifications
 */
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  
  // Link to relevant entity
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  actionUrl: varchar('action_url', { length: 512 }),
  
  // Status
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notification_user_idx').on(table.userId),
  userUnreadIdx: index('notification_user_unread_idx').on(table.userId, table.isRead),
  createdAtIdx: index('notification_created_at_idx').on(table.createdAt),
}));

// ============================================
// MEDIA ASSETS
// ============================================

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // R2 storage info
  bucket: varchar('bucket', { length: 180 }).notNull(),
  key: varchar('key', { length: 512 }).notNull(),
  url: text('url').notNull(),
  
  // File info
  fileName: varchar('file_name', { length: 255 }),
  mimeType: varchar('mime_type', { length: 180 }),
  size: integer('size'),
  
  // Ownership
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyUnique: uniqueIndex('media_bucket_key_idx').on(table.bucket, table.key),
  entityIdx: index('media_entity_idx').on(table.entityType, table.entityId),
}));
