// ========================================
// UI Label Maps — display labels, icons, colors for enums
// ========================================

import type {
	OperatingMode,
	SDGFocus,
	SectorCategory,
	SubSector,
} from './common';
import type { InstitutionType } from './institutions';
import type {
	StartupStage,
	StartupStatus,
	FundingRound,
	FounderRole,
} from './startups';

// ── Institution Type Labels ─────────────────────────────────
export const institutionTypeLabels: Record<InstitutionType, { label: string; icon: string; description: string }> = {
	incubator: { label: 'Incubator', icon: 'sprout', description: 'Nurture early-stage startups' },
	accelerator: { label: 'Accelerator', icon: 'rocket', description: 'Fast-track growth-stage ventures' },
	university: { label: 'University', icon: 'graduation-cap', description: 'Academic innovation hub' },
	vc: { label: 'VC Fund', icon: 'coins', description: 'Venture capital investment' },
	csr: { label: 'CSR Program', icon: 'handshake', description: 'Corporate social responsibility' },
};

// ── Operating Mode Labels ───────────────────────────────────
export const operatingModeLabels: Record<OperatingMode, { label: string; icon: string }> = {
	local: { label: 'Local', icon: 'map-pin' },
	national: { label: 'National', icon: 'landmark' },
	global: { label: 'Global', icon: 'globe' },
	'remote-first': { label: 'Remote-first', icon: 'monitor' },
};

// ── SDG Labels ──────────────────────────────────────────────
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

// ── Sector Category Labels (18 parent sectors) ─────────────
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

// ── Startup Labels ──────────────────────────────────────────
export const startupStageLabels: Record<StartupStage, { label: string; description: string; color: string }> = {
	ideation: { label: 'Ideation', description: 'Conceptual stage', color: 'bg-(--accent-light) text-(--primary)' },
	pre_seed_prototype: { label: 'Pre seed / Prototype', description: 'Building the first version', color: 'bg-blue-500/20 text-blue-600' },
	seed_mvp: { label: 'Seed / MVP', description: 'Minimum viable product', color: 'bg-teal-500/20 text-teal-600' },
	early_traction: { label: 'Early Traction', description: 'Initial customers/users', color: 'bg-green-500/20 text-green-600' },
	growth: { label: 'Growth', description: 'Scaling operations', color: 'bg-purple-500/20 text-purple-600' },
	scaling: { label: 'Scaling', description: 'Rapid expansion', color: 'bg-orange-500/20 text-orange-600' },
};

export const startupStatusLabels: Record<StartupStatus, { label: string; color: string }> = {
	public: { label: 'Public', color: 'bg-green-500/20 text-green-700' },
	private: { label: 'Private', color: 'bg-(--accent-light) text-(--primary)' },
};

export const fundingRoundLabels: Record<FundingRound, { label: string; description: string; color: string }> = {
	bootstrapped: { label: 'Bootstrapped', description: 'Self-funded', color: 'bg-(--accent-light) text-(--primary)' },
	pre_seed: { label: 'Pre-Seed', description: '$0 - $500K', color: 'bg-blue-500/20 text-blue-600' },
	seed: { label: 'Seed', description: '$500K - $2M', color: 'bg-green-500/20 text-green-600' },
	series_a: { label: 'Series A', description: '$2M - $15M', color: 'bg-purple-500/20 text-purple-600' },
	series_b_plus: { label: 'Series B+', description: '$15M+', color: 'bg-orange-500/20 text-orange-600' },
	unicorn: { label: 'Unicorn', description: '$1B+ valuation', color: 'bg-yellow-500/20 text-yellow-700' },
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
