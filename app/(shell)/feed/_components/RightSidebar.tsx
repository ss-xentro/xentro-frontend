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
				<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
					<h2 className="text-lg font-bold text-white mb-4">Trending</h2>
					<div className="space-y-4">
						{trending.map((item) => (
							<button
								key={item.tag}
								className="w-full text-left hover:bg-white/5 rounded-xl p-2 transition-colors"
							>
								<p className="text-gray-500 text-xs mb-1">Trending</p>
								<p className="text-white font-semibold text-[15px]">
									#{item.tag}
								</p>
								<p className="text-gray-500 text-xs mt-1">{item.posts} posts</p>
							</button>
						))}
					</div>
				</div>

				{/* Suggestions */}
				<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
					<h2 className="text-lg font-bold text-white mb-4">Who to follow</h2>
					<div className="space-y-4">
						{suggestions.map((user) => (
							<div key={user.username} className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-white/8 border border-white/10" />
								<div className="flex-1 min-w-0">
									<p className="text-white font-semibold text-sm">
										{user.name}
									</p>
									<p className="text-gray-500 text-xs">@{user.username}</p>
								</div>
								<button
									onClick={onRequireAuth}
									className="px-4 py-1.5 bg-white text-[#0B0D10] rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
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
