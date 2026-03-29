import { trending, suggestions } from "../_lib/constants";

export default function RightSidebar({
	onRequireAuth,
}: {
	onRequireAuth: () => void;
}) {
	return (
		<aside className="sticky top-0 h-screen w-75 shrink-0 hidden xl:block p-4 overflow-y-auto overflow-x-hidden">
			<div className="space-y-4">
				{/* Trending */}
				<div className="bg-(--accent-subtle) backdrop-blur-xl border border-(--border) rounded-2xl p-4">
					<h2 className="text-lg font-bold text-(--primary) mb-4">Trending</h2>
					<div className="space-y-4">
						{trending.map((item) => (
							<button
								key={item.tag}
								className="w-full text-left hover:bg-(--accent-subtle) rounded-xl p-2 transition-colors"
							>
								<p className="text-(--secondary-light) text-xs mb-1">Trending</p>
								<p className="text-(--primary) font-semibold text-[15px]">
									#{item.tag}
								</p>
								<p className="text-(--secondary-light) text-xs mt-1">{item.posts} posts</p>
							</button>
						))}
					</div>
				</div>

				{/* Suggestions */}
				<div className="bg-(--accent-subtle) backdrop-blur-xl border border-(--border) rounded-2xl p-4">
					<h2 className="text-lg font-bold text-(--primary) mb-4">Who to follow</h2>
					<div className="space-y-4">
						{suggestions.map((user) => (
							<div key={user.username} className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-(--accent-light) border border-(--border)" />
								<div className="flex-1 min-w-0">
									<p className="text-(--primary) font-semibold text-sm">
										{user.name}
									</p>
									<p className="text-(--secondary-light) text-xs">@{user.username}</p>
								</div>
								<button
									onClick={onRequireAuth}
									className="px-4 py-1.5 bg-(--primary) text-(--background) rounded-full text-sm font-semibold hover:opacity-90 transition-colors"
								>
									Follow
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}
