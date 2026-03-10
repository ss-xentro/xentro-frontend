export interface Startup {
	id: string;
	name: string;
	stage: string | null;
	location: string | null;
	oneLiner: string | null;
	ownerId: string;
	createdAt: Date;
}

export interface EndorsementRequest {
	id: string;
	requesterName: string;
	requesterEmail: string;
	requesterAvatar: string | null;
	entityType: string;
	message: string | null;
	status: string;
	responseComment: string | null;
	createdAt: string;
}

export function formatStage(stage: string | null) {
	if (!stage) return 'Not specified';
	return stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ');
}
