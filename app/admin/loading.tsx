export default function AdminLoading() {
	return (
		<div className="space-y-6 animate-pulse p-6">
			<div className="h-8 w-48 bg-(--surface) rounded-lg" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="h-24 bg-(--surface) rounded-xl border border-(--border)" />
				))}
			</div>
			<div className="h-80 bg-(--surface) rounded-xl border border-(--border)" />
		</div>
	);
}
