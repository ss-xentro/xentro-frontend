export default function InstitutionLoading() {
	return (
		<div className="space-y-6 animate-pulse p-6">
			<div className="h-8 w-56 bg-(--surface) rounded-lg" />
			<div className="h-4 w-40 bg-(--surface) rounded-lg" />
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-32 bg-(--surface) rounded-xl border border-(--border)" />
				))}
			</div>
			<div className="h-96 bg-(--surface) rounded-xl border border-(--border)" />
		</div>
	);
}
