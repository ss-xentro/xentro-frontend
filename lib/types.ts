// ========================================
// XENTRO Data Types
// ========================================

export type InstitutionType = 'incubator' | 'accelerator' | 'university' | 'vc' | 'csr' | string;

export type OperatingMode = 'local' | 'national' | 'global' | 'remote-first';

export type SDGFocus = 'sdg-1' | 'sdg-2' | 'sdg-3' | 'sdg-4' | 'sdg-5' | 'sdg-6' | 'sdg-7' | 'sdg-8' | 'sdg-9' | 'sdg-10' | 'sdg-11' | 'sdg-12' | 'sdg-13' | 'sdg-14' | 'sdg-15' | 'sdg-16' | 'sdg-17';

export type SectorFocus = 'ai' | 'healthtech' | 'edtech' | 'climatetech' | 'fintech' | 'saas' | 'social-impact';

export type InstitutionStatus = 'draft' | 'published' | 'archived' | 'pending';

export type InstitutionRole = 'super_admin' | 'admin' | 'ambassador' | 'viewer';

export interface Institution {
  id: string;
  slug: string; // Unique URL-friendly identifier
  name: string;
  type: InstitutionType;
  tagline?: string | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  operatingMode?: OperatingMode | null;
  startupsSupported: number;
  studentsMentored: number;
  fundingFacilitated: number;
  fundingCurrency?: string | null;
  sdgFocus?: SDGFocus[];
  sectorFocus?: SectorFocus[];
  logo?: string | null;
  website?: string | null;
  linkedin?: string | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
  legalDocuments?: string[] | null;
  status: InstitutionStatus;
  verified: boolean;
  profileViews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionMember {
  id: string;
  institutionId: string;
  userId: string;
  role: InstitutionRole;
  invitedAt: string;
  acceptedAt?: string | null;
  adminApproved?: boolean;
  superAdminApproved?: boolean;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export type InstitutionApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface InstitutionApplication {
  id: string;
  name: string;
  email: string;
  type: InstitutionType;
  tagline?: string | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  operatingMode?: OperatingMode | null;
  startupsSupported?: number | null;
  studentsMentored?: number | null;
  fundingFacilitated?: number | string | null;
  fundingCurrency?: string | null;
  sdgFocus?: SDGFocus[] | null;
  sectorFocus?: SectorFocus[] | null;
  website?: string | null;
  linkedin?: string | null;
  phone?: string | null;
  description?: string | null;
  logo?: string | null;
  legalDocuments?: string[] | null;
  status: InstitutionApplicationStatus;
  remark?: string | null;
  verified: boolean;
  verificationToken?: string | null;
  institutionId?: string | null;
  applicantUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin';
}

export interface Program {
  id: string;
  institutionId: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  type: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Event {
  id: string;
  institutionId?: string;
  name: string;
  description?: string | null;
  date?: string;
  startTime?: string | null;
  location?: string | null;
  type?: string;
  price?: number | null;
  approved?: boolean;
}

// Startup Types
export type StartupStage = 'idea' | 'mvp' | 'early_traction' | 'growth' | 'scale';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'ceo' | 'cto' | 'coo' | 'cfo' | 'cpo' | 'founder' | 'co_founder';

export interface Startup {
  id: string;
  slug?: string | null;
  name: string;
  tagline?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  pitch?: string | null;
  description?: string | null;
  foundedDate?: string | null;
  stage?: StartupStage | null;
  status: StartupStatus;
  fundingRound?: FundingRound | null;
  fundsRaised?: number | string | null;
  fundingGoal?: number | string | null;
  fundingCurrency?: string | null;
  investors?: string[] | null;
  primaryContactEmail?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  oneLiner?: string | null;
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  pitchDeckUrl?: string | null;
  demoVideoUrl?: string | null;
  industry?: string | null;
  sectors?: SectorFocus[] | null;
  sdgFocus?: SDGFocus[] | null;
  teamSize?: number | null;
  employeeCount?: string | null;
  highlights?: string[] | null;
  mediaFeatures?: { title: string; url: string; source: string }[] | null;
  institutionId?: string | null;
  ownerId?: string | null;
  profileViews?: number;
  createdAt?: string;
  updatedAt?: string;

  // Pitch sections (nested from API)
  pitchAbout?: PitchAbout | null;
  pitchCompetitors?: PitchCompetitor[];
  pitchCustomers?: PitchCustomer[];
  pitchBusinessModels?: PitchBusinessModelItem[];
  pitchMarketSizes?: PitchMarketSizeItem[];
  pitchVisionStrategies?: PitchVisionStrategyItem[];
  pitchImpacts?: PitchImpactItem[];
  pitchCertifications?: PitchCertificationItem[];
}

// ── Pitch Section Types ──────────────────────────────
export interface PitchAbout {
  id?: string;
  about?: string | null;
  problemStatement?: string | null;
  solutionProposed?: string | null;
}

export interface PitchCompetitor {
  id?: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  position?: number;
}

export interface PitchCustomer {
  id?: string;
  name: string;
  role?: string | null;
  company?: string | null;
  testimonial: string;
  avatar?: string | null;
  position?: number;
}

export interface PitchBusinessModelItem {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  position?: number;
}

export interface PitchMarketSizeItem {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  position?: number;
}

export interface PitchVisionStrategyItem {
  id?: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  position?: number;
}

export interface PitchImpactItem {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  position?: number;
}

export interface PitchCertificationItem {
  id?: string;
  title: string;
  issuer?: string | null;
  dateAwarded?: string | null;
  imageUrl?: string | null;
  position?: number;
}

export interface StartupPitchData {
  about?: PitchAbout | null;
  competitors?: PitchCompetitor[];
  customers?: PitchCustomer[];
  businessModels?: PitchBusinessModelItem[];
  marketSizes?: PitchMarketSizeItem[];
  visionStrategies?: PitchVisionStrategyItem[];
  impacts?: PitchImpactItem[];
  certifications?: PitchCertificationItem[];
}

export interface StartupFounder {
  id: string;
  startupId: string;
  userId: string;
  name: string;
  email: string;
  role: FounderRole;
  isPrimary: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StartupTeamMember {
  id: string;
  userId: string;
  startupId: string;
  role: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Onboarding Form Data
export interface OnboardingFormData {
  type: InstitutionType | null;
  name: string;
  tagline: string;
  city: string;
  country: string;
  countryCode: string;
  operatingMode: OperatingMode | null;
  startupsSupported: number;
  studentsMentored: number;
  fundingFacilitated: number;
  fundingCurrency: string;
  sdgFocus: SDGFocus[];
  sectorFocus: SectorFocus[];
  logo: string | null;
  website: string;
  linkedin: string;
  email: string;
  phone: string;
  description: string;
  legalDocuments: string[];
}

// UI Label Maps
export const institutionTypeLabels: Record<InstitutionType, { label: string; emoji: string; description: string }> = {
  incubator: { label: 'Incubator', emoji: '🌱', description: 'Nurture early-stage startups' },
  accelerator: { label: 'Accelerator', emoji: '🚀', description: 'Fast-track growth-stage ventures' },
  university: { label: 'University', emoji: '🎓', description: 'Academic innovation hub' },
  vc: { label: 'VC Fund', emoji: '💰', description: 'Venture capital investment' },
  csr: { label: 'CSR Program', emoji: '🤝', description: 'Corporate social responsibility' },
};

export const operatingModeLabels: Record<OperatingMode, { label: string; emoji: string }> = {
  local: { label: 'Local', emoji: '📍' },
  national: { label: 'National', emoji: '🏛️' },
  global: { label: 'Global', emoji: '🌍' },
  'remote-first': { label: 'Remote-first', emoji: '💻' },
};

export const sdgLabels: Record<SDGFocus, { label: string; fullName: string; color: string }> = {
  'sdg-1': { label: '1', fullName: 'No Poverty', color: '#E5243B' },
  'sdg-2': { label: '2', fullName: 'Zero Hunger', color: '#DDA63A' },
  'sdg-3': { label: '3', fullName: 'Good Health and Well-being', color: '#4C9F38' },
  'sdg-4': { label: '4', fullName: 'Quality Education', color: '#C5192D' },
  'sdg-5': { label: '5', fullName: 'Gender Equality', color: '#FF3A21' },
  'sdg-6': { label: '6', fullName: 'Clean Water and Sanitation', color: '#26BDE2' },
  'sdg-7': { label: '7', fullName: 'Affordable and Clean Energy', color: '#FCC30B' },
  'sdg-8': { label: '8', fullName: 'Decent Work and Economic Growth', color: '#A21942' },
  'sdg-9': { label: '9', fullName: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
  'sdg-10': { label: '10', fullName: 'Reduced Inequalities', color: '#DD1367' },
  'sdg-11': { label: '11', fullName: 'Sustainable Cities and Communities', color: '#FD9D24' },
  'sdg-12': { label: '12', fullName: 'Responsible Consumption and Production', color: '#BF8B2E' },
  'sdg-13': { label: '13', fullName: 'Climate Action', color: '#3F7E44' },
  'sdg-14': { label: '14', fullName: 'Life Below Water', color: '#0A97D9' },
  'sdg-15': { label: '15', fullName: 'Life on Land', color: '#56C02B' },
  'sdg-16': { label: '16', fullName: 'Peace, Justice and Strong Institutions', color: '#00689D' },
  'sdg-17': { label: '17', fullName: 'Partnerships for the Goals', color: '#19486A' },
};

export const sectorLabels: Record<SectorFocus, { label: string; emoji: string }> = {
  ai: { label: 'AI & ML', emoji: '🤖' },
  healthtech: { label: 'HealthTech', emoji: '⚕️' },
  edtech: { label: 'EdTech', emoji: '📚' },
  climatetech: { label: 'ClimateTech', emoji: '🌿' },
  fintech: { label: 'FinTech', emoji: '💳' },
  saas: { label: 'SaaS', emoji: '☁️' },
  'social-impact': { label: 'Social Impact', emoji: '❤️' },
};

export const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
];

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

// Startup Label Maps
export const startupStageLabels: Record<StartupStage, { label: string; description: string; color: string }> = {
  idea: { label: 'Idea', description: 'Conceptual stage', color: 'bg-gray-100 text-gray-800' },
  mvp: { label: 'MVP', description: 'Minimum viable product', color: 'bg-blue-100 text-blue-800' },
  early_traction: { label: 'Early Traction', description: 'Initial customers/users', color: 'bg-green-100 text-green-800' },
  growth: { label: 'Growth', description: 'Scaling operations', color: 'bg-purple-100 text-purple-800' },
  scale: { label: 'Scale', description: 'Rapid expansion', color: 'bg-orange-100 text-orange-800' },
};

export const startupStatusLabels: Record<StartupStatus, { label: string; color: string }> = {
  public: { label: 'Public', color: 'bg-green-100 text-green-800' },
  private: { label: 'Private', color: 'bg-gray-100 text-gray-800' },
};

export const fundingRoundLabels: Record<FundingRound, { label: string; description: string; color: string }> = {
  bootstrapped: { label: 'Bootstrapped', description: 'Self-funded', color: 'bg-gray-100 text-gray-800' },
  pre_seed: { label: 'Pre-Seed', description: '$0 - $500K', color: 'bg-blue-100 text-blue-800' },
  seed: { label: 'Seed', description: '$500K - $2M', color: 'bg-green-100 text-green-800' },
  series_a: { label: 'Series A', description: '$2M - $15M', color: 'bg-purple-100 text-purple-800' },
  series_b_plus: { label: 'Series B+', description: '$15M+', color: 'bg-orange-100 text-orange-800' },
  unicorn: { label: 'Unicorn', description: '$1B+ valuation', color: 'bg-yellow-100 text-yellow-800' },
};

export const founderRoleLabels: Record<FounderRole, string> = {
  ceo: 'CEO',
  cto: 'CTO',
  coo: 'COO',
  cfo: 'CFO',
  cpo: 'CPO',
  founder: 'Founder',
  co_founder: 'Co-Founder',
};
