export { STAGE_OPTIONS, STATUS_OPTIONS, FUNDING_ROUND_OPTIONS } from '@/lib/constants';

export interface StartupFormData {
	name: string;
	tagline: string;
	logo: string;
	coverImage: string;
	pitch: string;
	description: string;
	stage: string;
	status: string;
	location: string;
	city: string;
	country: string;
	oneLiner: string;
	foundedDate: string;
	fundingRound: string;
	fundsRaised: string;
	fundingCurrency: string;
	website: string;
	linkedin: string;
	twitter: string;
	instagram: string;
	pitchDeckUrl: string;
	demoVideoUrl: string;
	industry: string;
	primaryContactEmail: string;
}

export const EMPTY_STARTUP_FORM: StartupFormData = {
	name: '',
	tagline: '',
	logo: '',
	coverImage: '',
	pitch: '',
	description: '',
	stage: 'ideation',
	status: 'public',
	location: '',
	city: '',
	country: '',
	oneLiner: '',
	foundedDate: '',
	fundingRound: 'bootstrapped',
	fundsRaised: '',
	fundingCurrency: 'USD',
	website: '',
	linkedin: '',
	twitter: '',
	instagram: '',
	pitchDeckUrl: '',
	demoVideoUrl: '',
	industry: '',
	primaryContactEmail: '',
};

export const INPUT_CLASS = 'w-full px-4 py-3 text-sm bg-background border border-(--border) rounded-lg focus:border-(--primary) focus:outline-none';
export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;
