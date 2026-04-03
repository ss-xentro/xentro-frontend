"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
	ROLE_LABELS,
	getDashboardUrl,
	BASE_NAV_ITEMS,
	DASHBOARD_NAV_PATH,
	type NavItem,
} from "../_lib/constants";

function NavIcon({ path, active }: { path: string; active?: boolean }) {
	return (
		<svg
			className={cn(
				"w-6 h-6 transition-all duration-200",
				active ? "text-(--primary)" : "text-(--secondary)",
			)}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			strokeWidth={active ? 2.5 : 2}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d={path} />
		</svg>
	);
}

export default function ExploreSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated, logout } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [profileOpen, setProfileOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);

	const navItems: NavItem[] = isAuthenticated
		? [
			...BASE_NAV_ITEMS,
			{
				icon: "dashboard",
				label: "Dashboard",
				href: getDashboardUrl(user?.role),
				path: DASHBOARD_NAV_PATH,
			},
		]
		: BASE_NAV_ITEMS;

	const username = user?.email ? user.email.split("@")[0] : "guest";

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setProfileOpen(false);
			}
		}
		if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [profileOpen]);

	const handleLogout = () => {
		logout();
		setProfileOpen(false);
		router.push("/login");
	};

	return (
		<aside
			className={cn(
				"relative sticky top-0 h-screen shrink-0 border-r border-(--border) hidden md:flex flex-col transition-all duration-300 ease-in-out",
				isCollapsed ? "w-20" : "w-72",
			)}
		>
			<div className="flex-1 flex flex-col items-center px-3 py-6 overflow-hidden">
				{/* Logo + Collapse Toggle */}
				<div className={cn("mb-6 w-full", !isCollapsed && "px-2")}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 min-w-0">
							<Image
								src="/xentro-logo.png"
								alt="Xentro"
								width={36}
								height={36}
								className="rounded-lg shrink-0"
							/>
							<span
								className={cn(
									"text-(--primary) font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300",
									isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
								)}
							>
								Xentro
							</span>
						</div>
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className={cn(
								"shrink-0 w-7 h-7 rounded-lg bg-(--accent-subtle) hover:bg-(--accent-light) flex items-center justify-center transition-all duration-200",
								isCollapsed && "mx-auto mt-1",
							)}
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<svg
								className={cn(
									"w-4 h-4 text-(--secondary) transition-transform duration-300",
									isCollapsed && "rotate-180",
								)}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
								/>
							</svg>
						</button>
					</div>
					<div
						className={cn(
							"mt-4 overflow-hidden transition-all duration-300",
							isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto",
						)}
					>
						<div className="h-px bg-(--border) mb-3" />
						<span className="text-xs font-medium text-(--secondary-light) uppercase tracking-widest whitespace-nowrap">
							{user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "Guest"}
						</span>
					</div>
				</div>

				{/* Search Bar */}
				{!isCollapsed && (
					<div className="mb-4 w-full px-2">
						<div className="relative">
							<input
								type="text"
								placeholder="Search..."
								aria-label="Search explore"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-4 py-2.5 pl-10 bg-(--accent-subtle) border border-(--border) rounded-xl text-(--primary) placeholder-(--secondary) text-sm focus:outline-none focus:border-blue-500/50 focus:bg-(--accent-subtle) transition-all duration-200"
							/>
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary-light)"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="space-y-1 w-full">
					{navItems.map((item) => {
						let isActive = false;
						if (item.href === "/explore/institute") {
							isActive = pathname.startsWith("/explore");
						} else {
							isActive = pathname === item.href;
						}
						return (
							<Link
								key={item.icon}
								href={item.href}
								className={cn(
									"relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group",
									isCollapsed ? "justify-center" : "",
									isActive
										? "bg-(--accent-light) animate-navHighlight"
										: "hover:bg-(--accent-subtle)",
								)}
							>
								<NavIcon path={item.path} active={isActive} />
								<span
									className={cn(
										"text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
										isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
										isActive ? "text-(--primary)" : "text-(--secondary)",
									)}
								>
									{item.label}
								</span>
								{isCollapsed && (
									<div className="absolute left-full ml-3 px-3 py-1.5 bg-(--surface-pressed) text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
										{item.label}
									</div>
								)}
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Profile Section */}
			<div className="p-3 border-t border-(--border)" ref={profileRef}>
				{profileOpen && (
					<div className="absolute bottom-20 left-3 right-3 bg-(--surface) border border-(--border) rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
						<div className="px-4 py-3 border-b border-(--border)">
							<p className="text-sm font-semibold text-(--primary) truncate">
								{user?.name ?? "Guest"}
							</p>
							<p className="text-xs text-(--secondary) truncate">@{username}</p>
						</div>
						<div className="p-1.5 space-y-0.5">
							<button
								onClick={() => setProfileOpen(false)}
								className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-(--primary-light) hover:bg-(--accent-subtle) hover:text-(--primary) transition-colors text-sm"
							>
								<svg
									className="w-4 h-4 shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								Preferences
							</button>
							<button
								onClick={() => setProfileOpen(false)}
								className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-(--primary-light) hover:bg-(--accent-subtle) hover:text-(--primary) transition-colors text-sm"
							>
								<svg
									className="w-4 h-4 shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								Help &amp; Support
							</button>
							<div className="my-1 h-px bg-(--border)" />
							{isAuthenticated ? (
								<button
									onClick={handleLogout}
									className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/150/10 hover:text-red-300 transition-colors text-sm"
								>
									<svg
										className="w-4 h-4 shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
									</svg>
									Log out @{username}
								</button>
							) : (
								<Link
									href="/join"
									onClick={() => setProfileOpen(false)}
									className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/150/10 hover:text-blue-300 transition-colors text-sm"
								>
									<svg
										className="w-4 h-4 shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
										/>
									</svg>
									Log in
								</Link>
							)}
						</div>
					</div>
				)}

				<button
					onClick={() => setProfileOpen((prev) => !prev)}
					className={cn(
						"w-full flex items-center gap-3 p-3 rounded-xl hover:bg-(--accent-subtle) transition-colors group relative",
						isCollapsed && "justify-center",
						profileOpen && "bg-(--accent-subtle)",
					)}
				>
					<div className="shrink-0 w-9 h-9 rounded-full bg-(--accent-light) border border-(--border) flex items-center justify-center">
						<span className="text-sm font-semibold text-(--primary)">
							{user?.name ? user.name.charAt(0).toUpperCase() : "?"}
						</span>
					</div>
					<div
						className={cn(
							"flex-1 text-left overflow-hidden transition-all duration-300",
							isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
						)}
					>
						<p className="text-sm font-medium text-(--primary) truncate">
							{user?.name ?? "Guest"}
						</p>
						<p className="text-xs text-(--secondary) truncate">@{username}</p>
					</div>
					{!isCollapsed && (
						<svg
							className="w-4 h-4 text-(--secondary-light) shrink-0"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<circle cx="5" cy="12" r="2" />
							<circle cx="12" cy="12" r="2" />
							<circle cx="19" cy="12" r="2" />
						</svg>
					)}
					{isCollapsed && (
						<div className="absolute left-full ml-3 px-3 py-1.5 bg-(--surface-pressed) text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
							{user?.name ?? "Guest"}
						</div>
					)}
				</button>
			</div>
		</aside>
	);
}
