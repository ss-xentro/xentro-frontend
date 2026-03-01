export default function MentorDashboardLoading() {
	return (
		<div className="space-y-6 animate-pulse p-6">
			<div className="h-8 w-52 bg-(--surface) rounded-lg" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-28 bg-(--surface) rounded-xl border border-(--border)" />
				))}
			</div>
			<div className="h-72 bg-(--surface) rounded-xl border border-(--border)" />
		</div>
	);
}
