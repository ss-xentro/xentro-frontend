export default function ShellLoading() {
	return (
		<div className="flex-1 animate-pulse p-6 space-y-6">
			<div className="h-6 w-48 bg-(--surface) rounded-lg" />
			<div className="space-y-3">
				<div className="h-4 w-full bg-(--surface) rounded-lg" />
				<div className="h-4 w-3/4 bg-(--surface) rounded-lg" />
				<div className="h-4 w-1/2 bg-(--surface) rounded-lg" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="h-32 bg-(--surface) rounded-xl" />
				))}
			</div>
		</div>
	);
}
