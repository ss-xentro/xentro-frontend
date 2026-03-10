// ========================================
// User / Auth Types
// ========================================

export interface User {
	id: string;
	email: string;
	name: string;
	avatar: string;
	role: 'admin' | 'startup' | 'founder' | 'mentor' | 'institution' | 'investor';
	unlockedContexts?: string[];
}
