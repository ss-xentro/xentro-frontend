/**
 * Shared application constants.
 * Import from here instead of defining locally in feature files.
 */

/** Startup stage options — extended with description + icon for rich pickers. */
export const STAGE_OPTIONS = [
	{ value: 'ideation', label: 'Ideation', description: 'Validating the concept', icon: 'lightbulb' },
	{ value: 'pre_seed_prototype', label: 'Pre seed / Prototype', description: 'Building the first version', icon: 'wrench' },
	{ value: 'seed_mvp', label: 'Seed / MVP', description: 'Building the MVP', icon: 'code' },
	{ value: 'early_traction', label: 'Early Traction', description: 'First users / revenue', icon: 'trending-up' },
	{ value: 'growth', label: 'Growth', description: 'Scaling product & team', icon: 'rocket' },
	{ value: 'scaling', label: 'Scaling', description: 'Expanding markets', icon: 'globe' },
] as const;

export type StageValue = (typeof STAGE_OPTIONS)[number]['value'];

/** Funding round options for startup profiles. */
export const FUNDING_ROUND_OPTIONS = [
	{ value: 'bootstrapped', label: 'Bootstrapped' },
	{ value: 'pre_seed', label: 'Pre-Seed' },
	{ value: 'seed', label: 'Seed' },
	{ value: 'series_a', label: 'Series A' },
	{ value: 'series_b_plus', label: 'Series B+' },
	{ value: 'unicorn', label: 'Unicorn' },
] as const;

export type FundingRoundValue = (typeof FUNDING_ROUND_OPTIONS)[number]['value'];

/** Visibility status options for startups. */
export const STATUS_OPTIONS = [
	{ value: 'public', label: 'Public' },
	{ value: 'private', label: 'Private' },
] as const;

export type StatusValue = (typeof STATUS_OPTIONS)[number]['value'];
