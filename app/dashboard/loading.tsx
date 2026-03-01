export default function DashboardLoading() {
	return (
		<div className="space-y-6 animate-pulse p-6">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="h-7 w-48 bg-(--surface) rounded-lg" />
					<div className="h-4 w-32 bg-(--surface) rounded-lg" />
				</div>
				<div className="h-10 w-28 bg-(--surface) rounded-xl" />
			</div>
			{/* Stats grid skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-24 bg-(--surface) rounded-xl border border-(--border)" />
				))}
			</div>
			{/* Content skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 h-64 bg-(--surface) rounded-xl border border-(--border)" />
				<div className="h-64 bg-(--surface) rounded-xl border border-(--border)" />
			</div>
		</div>
	);
}
