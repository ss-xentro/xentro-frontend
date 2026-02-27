/**
 * XENTRO Unified Types
 *
 * Type definitions for the context-based architecture
 */

// ============================================
// USER CONTEXTS
// ============================================

export type UserContext = 'explorer' | 'startup' | 'mentor' | 'institute' | 'admin';

export interface UserContextInfo {
  context: UserContext;
  entityId?: string; // startup_id, institution_id, etc.
  role?: string;     // founder, admin, L1, etc.
  name?: string;     // Entity name for display
}

// ============================================
// JWT PAYLOADS
// ============================================

export interface BaseJwtPayload {
  sub: string;        // User ID
  email: string;
  name: string;
  emailVerified: boolean;
  unlockedContexts: UserContext[];
  iat: number;
  exp: number;
}

export interface ContextJwtPayload extends BaseJwtPayload {
  context: UserContext;
  contextEntityId?: string;
  contextRole?: string;
}

// ============================================
// AUTH
// ============================================

export type AuthProvider = 'google' | 'credentials' | 'otp';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    unlockedContexts: UserContext[];
  };
  token?: string;
  error?: string;
}

export interface OtpPurpose {
  type: 'login' | 'verify_email' | 'reset_password' | 'two_factor';
}

// ============================================
// FORMS ENGINE
// ============================================

export type FormType =
  | 'startup_create'
  | 'startup_update'
  | 'mentor_apply'
  | 'mentor_update'
  | 'institute_create'
  | 'institute_update'
  | 'event_create'
  | 'program_create'
  | 'team_invite'
  | 'general';

export type FormStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface Form {
  id: string;
  type: FormType;
  status: FormStatus;
  submittedBy: string;
  submittedAt?: Date;
  data: Record<string, unknown>;
  attachments: FormAttachment[];
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  resultEntityType?: string;
  resultEntityId?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormAttachment {
  name: string;
  url: string;
  type: string;
}

export interface FormReview {
  id: string;
  formId: string;
  reviewerId: string;
  action: 'approve' | 'reject' | 'request_changes' | 'escalate';
  previousStatus: FormStatus;
  newStatus: FormStatus;
  notes?: string;
  createdAt: Date;
}

// Form data shapes for different form types
export interface StartupCreateFormData {
  name: string;
  tagline?: string;
  pitch?: string;
  description?: string;
  stage: StartupStage;
  city?: string;
  country?: string;
  sectors?: string[];
  sdgFocus?: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  pitchDeckUrl?: string;
  demoVideoUrl?: string;
  founders: {
    name: string;
    email: string;
    role: StartupRole;
    title?: string;
  }[];
}

export interface MentorApplyFormData {
  headline: string;
  bio: string;
  expertise: string[];
  industries: string[];
  occupation: string;
  company?: string;
  linkedinUrl?: string;
  yearsExperience: number;
  hourlyRate?: number;
  currency?: string;
  availability?: Record<string, boolean>;
}

export interface InstitutionCreateFormData {
  name: string;
  type: string;
  tagline?: string;
  description?: string;
  city?: string;
  country?: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  sectorFocus?: string[];
  sdgFocus?: string[];
  operatingMode?: string;
}

// ============================================
// STARTUPS
// ============================================

export type StartupStage = 'idea' | 'mvp' | 'early_traction' | 'growth' | 'scale';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus';
export type StartupRole = 'founder' | 'co_founder' | 'cto' | 'coo' | 'cfo' | 'team_member';

export interface Startup {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  pitch?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  stage: StartupStage;
  status: StartupStatus;
  city?: string;
  country?: string;
  fundingRound?: FundingRound;
  fundsRaised?: number;
  fundingGoal?: number;
  currency: string;
  sectors: string[];
  sdgFocus: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  pitchDeckUrl?: string;
  demoVideoUrl?: string;
  teamSize: number;
  profileViews: number;
  institutionId?: string;
  formId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartupMember {
  id: string;
  startupId: string;
  userId: string;
  role: StartupRole;
  title?: string;
  invitedBy?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  // Populated
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// ============================================
// INSTITUTIONS
// ============================================

export type InstituteRole = 'owner' | 'admin' | 'manager' | 'viewer';

export interface Institution {
  id: string;
  slug: string;
  name: string;
  type: string;
  tagline?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  city?: string;
  country?: string;
  operatingMode?: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  sectorFocus: string[];
  sdgFocus: string[];
  startupsSupported: number;
  mentorsCount: number;
  fundingFacilitated: number;
  profileViews: number;
  status: string;
  verified: boolean;
  formId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutionMember {
  id: string;
  institutionId: string;
  userId: string;
  role: InstituteRole;
  title?: string;
  invitedBy?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  // Populated
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// ============================================
// MENTORS
// ============================================

export type MentorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface MentorProfile {
  id: string;
  userId: string;
  status: MentorStatus;
  headline?: string;
  bio?: string;
  expertise: string[];
  industries: string[];
  occupation?: string;
  company?: string;
  linkedinUrl?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  currency: string;
  availability?: Record<string, boolean>;
  totalSessions: number;
  totalMentees: number;
  rating?: number;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  // Populated
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// ============================================
// ADMIN
// ============================================

export type AdminLevel = 'L1' | 'L2' | 'L3';

export interface AdminProfile {
  id: string;
  userId: string;
  level: AdminLevel;
  permissions: string[];
  assignedBy?: string;
  assignedAt: Date;
  isActive: boolean;
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  // L1 - Basic review
  REVIEW_FORMS: 'review_forms',
  VIEW_REPORTS: 'view_reports',

  // L2 - Moderation
  APPROVE_FORMS: 'approve_forms',
  REJECT_FORMS: 'reject_forms',
  MODERATE_CONTENT: 'moderate_content',

  // L3 - Full control
  MANAGE_ADMINS: 'manage_admins',
  MANAGE_USERS: 'manage_users',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

export const ADMIN_LEVEL_PERMISSIONS: Record<AdminLevel, string[]> = {
  L1: [ADMIN_PERMISSIONS.REVIEW_FORMS, ADMIN_PERMISSIONS.VIEW_REPORTS],
  L2: [
    ADMIN_PERMISSIONS.REVIEW_FORMS,
    ADMIN_PERMISSIONS.VIEW_REPORTS,
    ADMIN_PERMISSIONS.APPROVE_FORMS,
    ADMIN_PERMISSIONS.REJECT_FORMS,
    ADMIN_PERMISSIONS.MODERATE_CONTENT,
  ],
  L3: Object.values(ADMIN_PERMISSIONS),
};

// ============================================
// FEED SYSTEM
// ============================================

export type InteractionType = 'appreciate' | 'viewed' | 'mentor_tip' | 'saved';

export interface FeedItem {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  sectors: string[];
  stages: string[];
  createdBy?: string;
  creatorType?: string;
  creatorId?: string;
  creatorName?: string;
  creatorLogo?: string;
  viewCount: number;
  appreciationCount: number;
  score: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Populated for current user
  userInteraction?: {
    hasAppreciated: boolean;
    hasViewed: boolean;
    hasSaved: boolean;
  };
}

export interface FeedInteraction {
  id: string;
  feedItemId: string;
  userId: string;
  type: InteractionType;
  createdAt: Date;
}

// ============================================
// NOTIFICATIONS
// ============================================

export type NotificationType =
  | 'form_submitted'
  | 'form_approved'
  | 'form_rejected'
  | 'team_invite'
  | 'mention'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ============================================
// ACTIVITY LOGS
// ============================================

export interface ActivityLog {
  id: string;
  userId?: string;
  context?: UserContext;
  contextEntityId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Activity action types
export const ACTIVITY_ACTIONS = {
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',

  // Forms
  FORM_CREATED: 'form_created',
  FORM_SUBMITTED: 'form_submitted',
  FORM_APPROVED: 'form_approved',
  FORM_REJECTED: 'form_rejected',

  // Startup
  STARTUP_CREATED: 'startup_created',
  STARTUP_UPDATED: 'startup_updated',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',

  // Institution
  INSTITUTION_CREATED: 'institution_created',
  INSTITUTION_UPDATED: 'institution_updated',

  // Mentor
  MENTOR_APPLIED: 'mentor_applied',
  MENTOR_APPROVED: 'mentor_approved',

  // Feed
  FEED_APPRECIATED: 'feed_appreciated',
  FEED_SAVED: 'feed_saved',

  // Context
  CONTEXT_SWITCHED: 'context_switched',
} as const;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// CONTEXT SWITCH
// ============================================

export interface ContextSwitchRequest {
  context: UserContext;
  entityId?: string; // Required for startup/institute contexts
}

export interface ContextSwitchResponse {
  success: boolean;
  contextToken?: string; // New scoped JWT
  contextInfo?: UserContextInfo;
  error?: string;
}

// ============================================
// USER PROFILE
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  unlockedContexts: UserContext[];
  activeContext: UserContext;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  // Associated profiles
  explorerProfile?: ExplorerProfile;
  mentorProfile?: MentorProfile;
  adminProfile?: AdminProfile;
  // Context-specific data
  startups?: { id: string; name: string; role: StartupRole }[];
  institutions?: { id: string; name: string; role: InstituteRole }[];
}

export interface ExplorerProfile {
  id: string;
  userId: string;
  bio?: string;
  educationLevel?: string;
  interests: string[];
  skills: string[];
  preferredSectors: string[];
  preferredStages: string[];
  totalViews: number;
  totalAppreciations: number;
}
