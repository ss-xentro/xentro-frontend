import { pgEnum, pgTable, uuid, varchar, timestamp, boolean, text, integer, numeric, uniqueIndex, bigint } from 'drizzle-orm/pg-core';

export const accountTypeEnum = pgEnum('account_type', ['explorer', 'startup', 'mentor', 'investor', 'institution', 'admin', 'approver']);
export const createdByTypeEnum = pgEnum('created_by_type', ['mentor', 'startup', 'institution', 'investor']);
export const entityTypeEnum = pgEnum('entity_type', ['mentor', 'student', 'startup', 'investor', 'event']);
export const resourceTypeEnum = pgEnum('resource_type', ['video', 'pdf', 'link', 'course']);
export const authProviderEnum = pgEnum('auth_provider', ['credentials', 'google']);
export const mentorStatusEnum = pgEnum('mentor_status', ['pending', 'approved', 'rejected']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  accountType: accountTypeEnum('account_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex('users_email_idx').on(table.email),
}));

export const authAccounts = pgTable('auth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: authProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 320 }).notNull(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerAccountUnique: uniqueIndex('auth_accounts_provider_account_idx').on(table.provider, table.providerAccountId),
}));

export const explorerProfiles = pgTable('explorer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  educationLevel: varchar('education_level', { length: 255 }),
  interests: text('interests'),
  upgraded: boolean('upgraded').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const startups = pgTable('startups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  stage: varchar('stage', { length: 100 }),
  location: varchar('location', { length: 255 }),
  oneLiner: varchar('one_liner', { length: 280 }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 120 }).notNull(),
}, (table) => ({
  memberUnique: uniqueIndex('team_member_unique').on(table.userId, table.startupId),
}));

export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expertise: text('expertise'),
  rate: numeric('rate', { precision: 12, scale: 2 }),
  verified: boolean('verified').default(false).notNull(),
  status: mentorStatusEnum('status').default('pending').notNull(),
  occupation: varchar('occupation', { length: 255 }),
  packages: text('packages'),
  achievements: text('achievements'),
  availability: text('availability'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedReason: text('rejected_reason'),
});

export const approvers = pgTable('approvers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  mobile: varchar('mobile', { length: 50 }),
  employeeId: varchar('employee_id', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex('approvers_email_idx').on(table.email),
  employeeIdUnique: uniqueIndex('approvers_employee_id_idx').on(table.employeeId),
}));

export const investorProfiles = pgTable('investor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  identityVerified: boolean('identity_verified').default(false).notNull(),
  fundsDeclared: boolean('funds_declared').default(false).notNull(),
  experienceVerified: boolean('experience_verified').default(false).notNull(),
});

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 280 }),
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  countryCode: varchar('country_code', { length: 4 }),
  operatingMode: varchar('operating_mode', { length: 50 }),
  location: varchar('location', { length: 255 }),
  startupsSupported: integer('startups_supported').default(0).notNull(),
  studentsMentored: integer('students_mentored').default(0).notNull(),
  fundingFacilitated: numeric('funding_facilitated', { precision: 16, scale: 2 }).default('0').notNull(),
  fundingCurrency: varchar('funding_currency', { length: 8 }),
  logo: varchar('logo', { length: 255 }),
  website: varchar('website', { length: 255 }),
  linkedin: varchar('linkedin', { length: 255 }),
  description: text('description'),
  status: varchar('status', { length: 32 }).default('draft').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const institutionApplications = pgTable('institution_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 280 }),
  city: varchar('city', { length: 180 }),
  country: varchar('country', { length: 180 }),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  logo: varchar('logo', { length: 255 }),
  status: varchar('status', { length: 32 }).default('pending').notNull(),
  remark: text('remark'),
  verificationToken: varchar('verification_token', { length: 255 }),
  verified: boolean('verified').default(false).notNull(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  applicantUserId: uuid('applicant_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  bucket: varchar('bucket', { length: 180 }).notNull(),
  key: varchar('key', { length: 512 }).notNull(),
  url: text('url').notNull(),
  mimeType: varchar('mime_type', { length: 180 }),
  size: bigint('size', { mode: 'number' }),
  entityType: varchar('entity_type', { length: 120 }),
  entityId: uuid('entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyBucketIdx: uniqueIndex('media_assets_bucket_key_idx').on(table.bucket, table.key),
}));

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  description: text('description'),
  duration: varchar('duration', { length: 120 }),
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdByType: createdByTypeEnum('created_by_type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  type: varchar('type', { length: 120 }),
  startTime: timestamp('start_time', { withTimezone: true }),
  price: numeric('price', { precision: 12, scale: 2 }),
  approved: boolean('approved').default(false).notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'set null' }),
  mentorId: uuid('mentor_id').references(() => mentorProfiles.id, { onDelete: 'set null' }),
  slotTime: timestamp('slot_time', { withTimezone: true }),
  status: varchar('status', { length: 120 }).notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  outcome: text('outcome'),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 120 }).notNull(),
  providerRef: varchar('provider_ref', { length: 255 }),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 120 }).notNull(),
  status: varchar('status', { length: 120 }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
});

export const trustScores = pgTable('trust_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityId: uuid('entity_id').notNull(),
  entityType: entityTypeEnum('entity_type').notNull(),
  score: integer('score').notNull(),
  level: varchar('level', { length: 120 }).notNull(),
});

export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  blockType: varchar('block_type', { length: 120 }).notNull(),
  contentRef: varchar('content_ref', { length: 255 }).notNull(),
  position: integer('position').default(0).notNull(),
});

export const blockVisibilities = pgTable('block_visibilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockId: uuid('block_id').references(() => blocks.id, { onDelete: 'cascade' }).notNull(),
  audience: varchar('audience', { length: 120 }).notNull(),
});

export const updateLogs = pgTable('update_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const demandSignals = pgTable('demand_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  startupId: uuid('startup_id').references(() => startups.id, { onDelete: 'cascade' }).notNull(),
  intentType: varchar('intent_type', { length: 120 }).notNull(),
  note: text('note'),
});

export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(true).notNull(),
});

export const channels = pgTable('channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const learningResources = pgTable('learning_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  type: resourceTypeEnum('type').notNull(),
  r2Path: varchar('r2_path', { length: 512 }),
  stage: varchar('stage', { length: 120 }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
});
