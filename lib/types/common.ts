// ========================================
// Common / Shared Types (SDG, Sectors, Operating Modes)
// ========================================

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
