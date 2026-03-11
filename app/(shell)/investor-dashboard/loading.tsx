export default function InvestorDashboardLoading() {
	return (
		<div className="space-y-6 animate-pulse p-6">
			<div className="h-8 w-52 bg-(--surface) rounded-lg" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-24 bg-(--surface) rounded-xl border border-(--border)" />
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 h-64 bg-(--surface) rounded-xl border border-(--border)" />
				<div className="h-64 bg-(--surface) rounded-xl border border-(--border)" />
			</div>
		</div>
	);
}
