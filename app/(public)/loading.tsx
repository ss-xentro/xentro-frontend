export default function PublicLoading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-(--background)">
			<div className="flex flex-col items-center gap-4">
				<div className="w-10 h-10 border-3 border-(--border) border-t-accent rounded-full animate-spin" />
				<p className="text-sm text-(--secondary)">Loading...</p>
			</div>
		</div>
	);
}
