import { Card, Button, Spinner } from '@/components/ui';
import { RecycleBinUser, accountTypeLabels, accountTypeColors } from '../_lib/constants';

interface RecycleBinCardProps {
	user: RecycleBinUser;
	actionLoading: string | null;
	onRestore: (userId: string, userName: string) => void;
	onDelete: (userId: string, userName: string) => void;
}

export default function RecycleBinCard({ user, actionLoading, onRestore, onDelete }: RecycleBinCardProps) {
	const initials = user.name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<Card className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
			<div className="flex items-center gap-4 flex-1 min-w-0">
				<div className="w-10 h-10 rounded-full bg-(--accent-light) flex items-center justify-center text-sm font-semibold text-(--secondary-light) overflow-hidden flex-shrink-0">
					{user.avatar ? (
						<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
					) : (
						initials
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-(--primary) truncate">{user.name}</h3>
						<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${accountTypeColors[user.accountType] || 'bg-(--accent-light) text-(--primary-light)'}`}>
							{accountTypeLabels[user.accountType] || user.accountType}
						</span>
					</div>
					<div className="flex items-center gap-3 mt-1 text-sm text-(--secondary-light)">
						<span className="truncate">{user.email}</span>
						<span className="text-(--primary-light)">|</span>
						<span>
							Deleted{' '}
							{new Date(user.deletedAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</span>
						<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.daysRemaining <= 7
								? 'bg-red-100 text-red-700'
								: user.daysRemaining <= 14
									? 'bg-yellow-100 text-yellow-700'
									: 'bg-green-100 text-green-700'
							}`}>
							{user.daysRemaining} day{user.daysRemaining !== 1 ? 's' : ''} remaining
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 ml-4">
				<Button
					variant="ghost"
					size="sm"
					className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
					onClick={() => onRestore(user.id, user.name)}
					disabled={actionLoading === `restore-${user.id}`}
				>
					{actionLoading === `restore-${user.id}` ? (
						<Spinner size="sm" className="mr-1" />
					) : (
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					)}
					Restore
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="text-red-600 hover:text-red-700 hover:bg-red-50"
					onClick={() => onDelete(user.id, user.name)}
					disabled={actionLoading === `delete-${user.id}`}
				>
					{actionLoading === `delete-${user.id}` ? (
						<Spinner size="sm" className="mr-1" />
					) : (
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					)}
					Delete Forever
				</Button>
			</div>
		</Card>
	);
}
