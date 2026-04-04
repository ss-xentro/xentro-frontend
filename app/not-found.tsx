import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="max-w-lg w-full text-center space-y-8">
				{/* Stylized 404 */}
				<div className="relative">
					<p className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tight text-(--border) select-none">
						404
					</p>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-16 h-16 rounded-full bg-(--surface) border border-(--border) flex items-center justify-center shadow-(--shadow-lg)">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-(--secondary)"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.3-4.3" />
								<path d="M11 8v6" />
								<path d="m8 11 6 0" />
							</svg>
						</div>
					</div>
				</div>

				{/* Copy */}
				<div className="space-y-3">
					<h1 className="text-2xl sm:text-3xl font-bold text-(--primary)">
						Page not found
					</h1>
					<p className="text-(--secondary) text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
						This page doesn&apos;t exist or has been moved.
					</p>
				</div>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Link
						href="/"
						className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out
							bg-(--primary) text-background hover:bg-(--primary-light)
							shadow-(--shadow-sm) hover:shadow-(--shadow-md)
							min-h-11 h-12 px-6 text-sm rounded-lg
							focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
							active:scale-[0.98]"
					>
						Go Home
					</Link>
					<Link
						href="/explore/institute"
						className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out
							bg-(--surface) text-(--primary) border border-(--border)
							hover:bg-(--surface-hover) hover:border-(--secondary-light)
							min-h-11 h-12 px-6 text-sm rounded-lg
							focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
							active:scale-[0.98]"
					>
						Explore Institutions
					</Link>
				</div>
			</div>
		</div>
	);
}
