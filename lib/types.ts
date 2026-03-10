// ========================================
// XENTRO Data Types
// ========================================

export type InstitutionType = 'incubator' | 'accelerator' | 'university' | 'vc' | 'csr' | string;

export type OperatingMode = 'local' | 'national' | 'global' | 'remote-first';

export type SDGFocus = 'sdg-1' | 'sdg-2' | 'sdg-3' | 'sdg-4' | 'sdg-5' | 'sdg-6' | 'sdg-7' | 'sdg-8' | 'sdg-9' | 'sdg-10' | 'sdg-11' | 'sdg-12' | 'sdg-13' | 'sdg-14' | 'sdg-15' | 'sdg-16' | 'sdg-17';

// ── Sector Categories (18 parent sectors) ──────────────────
export type SectorCategory =
  | 'technology-software'
  | 'fintech'
  | 'healthtech-biotech'
  | 'edtech'
  | 'ecommerce-retail'
  | 'food-agritech'
  | 'cleantech-climatetech'
  | 'mobility-transportation'
  | 'real-estate-proptech'
  | 'media-entertainment'
  | 'enterprise-b2b'
  | 'social-impact'
  | 'fashion-lifestyle'
  | 'travel-hospitality'
  | 'sports-gaming'
  | 'spacetech-deeptech'
  | 'consumer-services'
  | 'manufacturing-industry4'
  | 'defense';

// ── Sub-sector slugs ────────────────────────────────────────
export type SubSector =
  // Technology & Software
  | 'saas' | 'ai-ml' | 'generative-ai' | 'cybersecurity' | 'cloud-computing'
  | 'devtools' | 'web3-blockchain' | 'iot' | 'ar-vr-xr' | 'quantum-computing'
  | 'robotics-automation'
  // FinTech
  | 'digital-payments' | 'neobanking' | 'lending-platforms' | 'wealthtech'
  | 'insurtech' | 'regtech' | 'crypto-digital-assets'
  // HealthTech & BioTech
  | 'telemedicine' | 'health-saas' | 'diagnostics' | 'medical-devices'
  | 'biotech-research' | 'mental-health' | 'fitness-wellness'
  // EdTech
  | 'online-learning' | 'skill-development' | 'test-prep' | 'corporate-training'
  | 'language-learning' | 'ai-tutors' | 'school-management'
  // E-commerce & Retail
  | 'd2c-brands' | 'marketplaces' | 'social-commerce' | 'quick-commerce' | 'retail-tech'
  // Food & AgriTech
  | 'cloud-kitchens' | 'food-delivery-tech' | 'agri-supply-chain'
  | 'precision-farming' | 'organic-sustainable-farming' | 'farm-to-consumer'
  // CleanTech & ClimateTech
  | 'renewable-energy' | 'ev-mobility-tech' | 'carbon-tracking'
  | 'waste-management' | 'watertech' | 'sustainable-materials'
  // Mobility & Transportation
  | 'ride-sharing' | 'ev-infrastructure' | 'logistics-tech'
  | 'fleet-management' | 'autonomous-vehicles'
  // Real Estate & PropTech
  | 'real-estate-marketplaces' | 'smart-homes' | 'construction-tech'
  | 'co-living-co-working' | 'property-management-saas'
  // Media, Entertainment & Creator Economy
  | 'ott-platforms' | 'gaming' | 'esports' | 'creator-tools'
  | 'influencer-platforms' | 'musictech' | 'animation-vfx'
  // Enterprise & B2B Solutions
  | 'hrtech' | 'legaltech' | 'supply-chain-tech'
  | 'procurement-platforms' | 'crm-erp'
  // Social Impact & Non-Profit Tech
  | 'rural-development' | 'accessibility-tech' | 'ngo-platforms'
  | 'govtech' | 'civictech'
  // Fashion & Lifestyle
  | 'sustainable-fashion' | 'beautytech' | 'personal-care'
  | 'luxury-brands' | 'wearables'
  // Travel & Hospitality
  | 'traveltech' | 'booking-platforms' | 'tourism-experience' | 'hoteltech'
  // Sports & Gaming Infrastructure
  | 'sports-analytics' | 'fantasy-sports' | 'athlete-management'
  | 'training-tech' | 'motorsport-tech'
  // SpaceTech & DeepTech
  | 'satellite-tech' | 'aerospace' | 'defensetech'
  | 'advanced-materials' | 'semiconductors'
  // Consumer Services
  | 'home-services' | 'on-demand-services' | 'subscription-services'
  | 'pettech' | 'senior-care'
  // Manufacturing & Industry 4.0
  | 'smart-manufacturing' | 'industrial-automation' | '3d-printing'
  | 'supply-chain-robotics'
  // Defense & Military
  | 'defense-manufacturing' | 'defense-aerospace' | 'military-technology' | 'cyber-defense';

// SectorFocus = parent category OR sub-sector (any valid slug)
export type SectorFocus = SectorCategory | SubSector;

export type InstitutionStatus = 'draft' | 'published' | 'archived' | 'pending';

export type InstitutionRole = 'admin' | 'manager' | 'ambassador' | 'viewer';

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
  legalDocuments?: LegalDocument[] | string[] | null;
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
  managerApproved: boolean;
  adminApproved: boolean;
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
  legalDocuments?: LegalDocument[] | string[] | null;
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
  role: 'admin' | 'startup' | 'founder' | 'mentor' | 'institution' | 'investor';
  unlockedContexts?: string[];
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
export type StartupStage = 'ideation' | 'pre_seed_prototype' | 'seed_mvp' | 'early_traction' | 'growth' | 'scaling';
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
  programs?: { id: string; name: string; type: string; description?: string | null; isActive?: boolean }[] | null;
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
  legalDocuments: LegalDocument[];
}

export interface LegalDocument {
  url: string;
  name: string;
}

// UI Label Maps
export const institutionTypeLabels: Record<InstitutionType, { label: string; icon: string; description: string }> = {
  incubator: { label: 'Incubator', icon: 'sprout', description: 'Nurture early-stage startups' },
  accelerator: { label: 'Accelerator', icon: 'rocket', description: 'Fast-track growth-stage ventures' },
  university: { label: 'University', icon: 'graduation-cap', description: 'Academic innovation hub' },
  vc: { label: 'VC Fund', icon: 'coins', description: 'Venture capital investment' },
  csr: { label: 'CSR Program', icon: 'handshake', description: 'Corporate social responsibility' },
};

export const operatingModeLabels: Record<OperatingMode, { label: string; icon: string }> = {
  local: { label: 'Local', icon: 'map-pin' },
  national: { label: 'National', icon: 'landmark' },
  global: { label: 'Global', icon: 'globe' },
  'remote-first': { label: 'Remote-first', icon: 'monitor' },
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

// ── Sector category labels (18 parent sectors) ─────────────
export interface SectorCategoryInfo {
  label: string;
  icon: string;
  subSectors: { slug: SubSector; label: string }[];
}

export const sectorCategoryLabels: Record<SectorCategory, SectorCategoryInfo> = {
  'technology-software': {
    label: 'Technology & Software', icon: 'monitor',
    subSectors: [
      { slug: 'saas', label: 'SaaS' },
      { slug: 'ai-ml', label: 'AI / Machine Learning' },
      { slug: 'generative-ai', label: 'Generative AI' },
      { slug: 'cybersecurity', label: 'Cybersecurity' },
      { slug: 'cloud-computing', label: 'Cloud Computing' },
      { slug: 'devtools', label: 'DevTools' },
      { slug: 'web3-blockchain', label: 'Web3 / Blockchain' },
      { slug: 'iot', label: 'IoT' },
      { slug: 'ar-vr-xr', label: 'AR/VR / Extended Reality' },
      { slug: 'quantum-computing', label: 'Quantum Computing' },
      { slug: 'robotics-automation', label: 'Robotics & Automation' },
    ],
  },
  fintech: {
    label: 'FinTech', icon: 'credit-card',
    subSectors: [
      { slug: 'digital-payments', label: 'Digital Payments' },
      { slug: 'neobanking', label: 'Neobanking' },
      { slug: 'lending-platforms', label: 'Lending Platforms' },
      { slug: 'wealthtech', label: 'WealthTech' },
      { slug: 'insurtech', label: 'InsurTech' },
      { slug: 'regtech', label: 'RegTech' },
      { slug: 'crypto-digital-assets', label: 'Crypto & Digital Assets' },
    ],
  },
  'healthtech-biotech': {
    label: 'HealthTech & BioTech', icon: 'heart-pulse',
    subSectors: [
      { slug: 'telemedicine', label: 'Telemedicine' },
      { slug: 'health-saas', label: 'Health SaaS' },
      { slug: 'diagnostics', label: 'Diagnostics' },
      { slug: 'medical-devices', label: 'Medical Devices' },
      { slug: 'biotech-research', label: 'Biotech Research' },
      { slug: 'mental-health', label: 'Mental Health Platforms' },
      { slug: 'fitness-wellness', label: 'Fitness & Wellness Tech' },
    ],
  },
  edtech: {
    label: 'EdTech', icon: 'book-open',
    subSectors: [
      { slug: 'online-learning', label: 'Online Learning Platforms' },
      { slug: 'skill-development', label: 'Skill Development' },
      { slug: 'test-prep', label: 'Test Prep' },
      { slug: 'corporate-training', label: 'Corporate Training' },
      { slug: 'language-learning', label: 'Language Learning' },
      { slug: 'ai-tutors', label: 'AI Tutors' },
      { slug: 'school-management', label: 'School Management Systems' },
    ],
  },
  'ecommerce-retail': {
    label: 'E-commerce & Retail', icon: 'shopping-cart',
    subSectors: [
      { slug: 'd2c-brands', label: 'D2C Brands' },
      { slug: 'marketplaces', label: 'Marketplaces (B2B / B2C / C2C)' },
      { slug: 'social-commerce', label: 'Social Commerce' },
      { slug: 'quick-commerce', label: 'Quick Commerce' },
      { slug: 'retail-tech', label: 'Retail Tech' },
    ],
  },
  'food-agritech': {
    label: 'Food & AgriTech', icon: 'wheat',
    subSectors: [
      { slug: 'cloud-kitchens', label: 'Cloud Kitchens' },
      { slug: 'food-delivery-tech', label: 'Food Delivery Tech' },
      { slug: 'agri-supply-chain', label: 'Agri Supply Chain' },
      { slug: 'precision-farming', label: 'Precision Farming' },
      { slug: 'organic-sustainable-farming', label: 'Organic & Sustainable Farming' },
      { slug: 'farm-to-consumer', label: 'Farm-to-Consumer Platforms' },
    ],
  },
  'cleantech-climatetech': {
    label: 'CleanTech & ClimateTech', icon: 'leaf',
    subSectors: [
      { slug: 'renewable-energy', label: 'Renewable Energy' },
      { slug: 'ev-mobility-tech', label: 'EV & Mobility Tech' },
      { slug: 'carbon-tracking', label: 'Carbon Tracking' },
      { slug: 'waste-management', label: 'Waste Management' },
      { slug: 'watertech', label: 'WaterTech' },
      { slug: 'sustainable-materials', label: 'Sustainable Materials' },
    ],
  },
  'mobility-transportation': {
    label: 'Mobility & Transportation', icon: 'car',
    subSectors: [
      { slug: 'ride-sharing', label: 'Ride-sharing' },
      { slug: 'ev-infrastructure', label: 'EV Infrastructure' },
      { slug: 'logistics-tech', label: 'Logistics Tech' },
      { slug: 'fleet-management', label: 'Fleet Management' },
      { slug: 'autonomous-vehicles', label: 'Autonomous Vehicles' },
    ],
  },
  'real-estate-proptech': {
    label: 'Real Estate & PropTech', icon: 'home',
    subSectors: [
      { slug: 'real-estate-marketplaces', label: 'Real Estate Marketplaces' },
      { slug: 'smart-homes', label: 'Smart Homes' },
      { slug: 'construction-tech', label: 'Construction Tech' },
      { slug: 'co-living-co-working', label: 'Co-living / Co-working' },
      { slug: 'property-management-saas', label: 'Property Management SaaS' },
    ],
  },
  'media-entertainment': {
    label: 'Media, Entertainment & Creator Economy', icon: 'clapperboard',
    subSectors: [
      { slug: 'ott-platforms', label: 'OTT Platforms' },
      { slug: 'gaming', label: 'Gaming' },
      { slug: 'esports', label: 'Esports' },
      { slug: 'creator-tools', label: 'Creator Tools' },
      { slug: 'influencer-platforms', label: 'Influencer Platforms' },
      { slug: 'musictech', label: 'MusicTech' },
      { slug: 'animation-vfx', label: 'Animation & VFX' },
    ],
  },
  'enterprise-b2b': {
    label: 'Enterprise & B2B Solutions', icon: 'building2',
    subSectors: [
      { slug: 'hrtech', label: 'HRTech' },
      { slug: 'legaltech', label: 'LegalTech' },
      { slug: 'supply-chain-tech', label: 'Supply Chain Tech' },
      { slug: 'procurement-platforms', label: 'Procurement Platforms' },
      { slug: 'crm-erp', label: 'CRM & ERP Solutions' },
    ],
  },
  'social-impact': {
    label: 'Social Impact & Non-Profit Tech', icon: 'heart',
    subSectors: [
      { slug: 'rural-development', label: 'Rural Development' },
      { slug: 'accessibility-tech', label: 'Accessibility Tech' },
      { slug: 'ngo-platforms', label: 'NGO Platforms' },
      { slug: 'govtech', label: 'GovTech' },
      { slug: 'civictech', label: 'CivicTech' },
    ],
  },
  'fashion-lifestyle': {
    label: 'Fashion & Lifestyle', icon: 'shirt',
    subSectors: [
      { slug: 'sustainable-fashion', label: 'Sustainable Fashion' },
      { slug: 'beautytech', label: 'BeautyTech' },
      { slug: 'personal-care', label: 'Personal Care' },
      { slug: 'luxury-brands', label: 'Luxury Brands' },
      { slug: 'wearables', label: 'Wearables' },
    ],
  },
  'travel-hospitality': {
    label: 'Travel & Hospitality', icon: 'plane',
    subSectors: [
      { slug: 'traveltech', label: 'TravelTech' },
      { slug: 'booking-platforms', label: 'Booking Platforms' },
      { slug: 'tourism-experience', label: 'Tourism Experience Tech' },
      { slug: 'hoteltech', label: 'HotelTech' },
    ],
  },
  'sports-gaming': {
    label: 'Sports & Gaming Infrastructure', icon: 'gamepad',
    subSectors: [
      { slug: 'sports-analytics', label: 'Sports Analytics' },
      { slug: 'fantasy-sports', label: 'Fantasy Sports' },
      { slug: 'athlete-management', label: 'Athlete Management' },
      { slug: 'training-tech', label: 'Training Tech' },
      { slug: 'motorsport-tech', label: 'Motorsport Tech' },
    ],
  },
  'spacetech-deeptech': {
    label: 'SpaceTech & DeepTech', icon: 'atom',
    subSectors: [
      { slug: 'satellite-tech', label: 'Satellite Tech' },
      { slug: 'aerospace', label: 'Aerospace' },
      { slug: 'defensetech', label: 'DefenseTech' },
      { slug: 'advanced-materials', label: 'Advanced Materials' },
      { slug: 'semiconductors', label: 'Semiconductors' },
    ],
  },
  'consumer-services': {
    label: 'Consumer Services', icon: 'sofa',
    subSectors: [
      { slug: 'home-services', label: 'Home Services' },
      { slug: 'on-demand-services', label: 'On-demand Services' },
      { slug: 'subscription-services', label: 'Subscription Services' },
      { slug: 'pettech', label: 'PetTech' },
      { slug: 'senior-care', label: 'Senior Care' },
    ],
  },
  'manufacturing-industry4': {
    label: 'Manufacturing & Industry 4.0', icon: 'factory',
    subSectors: [
      { slug: 'smart-manufacturing', label: 'Smart Manufacturing' },
      { slug: 'industrial-automation', label: 'Industrial Automation' },
      { slug: '3d-printing', label: '3D Printing' },
      { slug: 'supply-chain-robotics', label: 'Supply Chain Robotics' },
    ],
  },
  'defense': {
    label: 'Defense & Military', icon: 'shield',
    subSectors: [
      { slug: 'defense-manufacturing', label: 'Defense Manufacturing' },
      { slug: 'defense-aerospace', label: 'Defense Aerospace' },
      { slug: 'military-technology', label: 'Military Technology' },
      { slug: 'cyber-defense', label: 'Cyber Defense' },
    ],
  },
};

// ── Flat lookup: slug → { label, icon } for any sector/sub-sector ──
export const sectorLabels: Record<string, { label: string; icon: string }> = (() => {
  const map: Record<string, { label: string; icon: string }> = {};
  for (const [catSlug, cat] of Object.entries(sectorCategoryLabels)) {
    map[catSlug] = { label: cat.label, icon: cat.icon };
    for (const sub of cat.subSectors) {
      map[sub.slug] = { label: sub.label, icon: cat.icon };
    }
  }
  return map;
})();

// Helper: get parent category for a sub-sector slug
export function getSectorCategory(slug: string): SectorCategory | null {
  for (const [catSlug, cat] of Object.entries(sectorCategoryLabels)) {
    if (catSlug === slug) return catSlug as SectorCategory;
    if (cat.subSectors.some(s => s.slug === slug)) return catSlug as SectorCategory;
  }
  return null;
}

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
  ideation: { label: 'Ideation', description: 'Conceptual stage', color: 'bg-gray-100 text-gray-800' },
  pre_seed_prototype: { label: 'Pre seed / Prototype', description: 'Building the first version', color: 'bg-blue-100 text-blue-800' },
  seed_mvp: { label: 'Seed / MVP', description: 'Minimum viable product', color: 'bg-teal-100 text-teal-800' },
  early_traction: { label: 'Early Traction', description: 'Initial customers/users', color: 'bg-green-100 text-green-800' },
  growth: { label: 'Growth', description: 'Scaling operations', color: 'bg-purple-100 text-purple-800' },
  scaling: { label: 'Scaling', description: 'Rapid expansion', color: 'bg-orange-100 text-orange-800' },
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
