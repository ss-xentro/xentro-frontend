'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Post } from '../_lib/constants';

export default function PostCard({ post, isLast, onRequireAuth }: { post: Post; isLast?: boolean; onRequireAuth?: () => void }) {
	const [liked, setLiked] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);

	return (
		<div
			className={cn(
				'relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20',
				'animate-fadeIn',
				!isLast && 'mb-3'
			)}
		>
			<div className="flex gap-3">
				{/* Avatar */}
				<div className="shrink-0">
					<div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden">
						<div className="w-full h-full bg-gray-700" />
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-2 mb-2">
						<span className="font-semibold text-white text-[15px]">{post.author.name}</span>
						<span className="text-gray-500 text-[14px]">@{post.author.username}</span>
						<span className="text-white/30 text-[14px]">·</span>
						<span className="text-white/30 text-[14px]">{post.timestamp}</span>
					</div>

					{/* Post Text */}
					<p className="text-gray-200 text-[15px] leading-relaxed mb-3">{post.content}</p>

					{/* Actions */}
					<div className="flex items-center justify-between max-w-md pt-1">
						{/* Reply */}
						<button onClick={() => onRequireAuth?.()} className="group flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
							<div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
								<svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</div>
							<span className="text-[13px]">{post.replies}</span>
						</button>

						{/* Repost */}
						<button onClick={() => onRequireAuth?.()} className="group flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors">
							<div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
								<svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							</div>
							<span className="text-[13px]">{post.reposts}</span>
						</button>

						{/* Like */}
						<button
							onClick={() => { if (onRequireAuth) { onRequireAuth(); return; } setLiked(!liked); }}
							className={cn(
								'group flex items-center gap-2 transition-colors',
								liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
							)}
						>
							<div className={cn(
								'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
								liked ? 'bg-pink-500/10 scale-110' : 'group-hover:bg-pink-500/10'
							)}>
								<svg className="w-4.5 h-4.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							</div>
							<span className="text-[13px]">{post.likes + (liked ? 1 : 0)}</span>
						</button>

						{/* Bookmark */}
						<button
							onClick={() => { if (onRequireAuth) { onRequireAuth(); return; } setBookmarked(!bookmarked); }}
							className={cn(
								'group flex items-center gap-2 transition-colors',
								bookmarked ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
							)}
						>
							<div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
								<svg className="w-4.5 h-4.5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
								</svg>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
