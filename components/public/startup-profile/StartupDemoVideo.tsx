'use client';

interface StartupDemoVideoProps {
	demoVideoUrl: string;
}

function getYouTubeEmbedUrl(url: string): string {
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = url.match(regExp);
	const videoId = match && match[7].length === 11 ? match[7] : null;
	return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
	const regExp = /vimeo\.com\/(\d+)/;
	const match = url.match(regExp);
	const videoId = match ? match[1] : null;
	return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

export function StartupDemoVideo({ demoVideoUrl }: StartupDemoVideoProps) {
	return (
		<section>
			<div className="aspect-video rounded-xl overflow-hidden bg-black">
				{demoVideoUrl.includes('youtube') || demoVideoUrl.includes('youtu.be') ? (
					<iframe
						src={getYouTubeEmbedUrl(demoVideoUrl)}
						className="w-full h-full"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				) : demoVideoUrl.includes('vimeo') ? (
					<iframe
						src={getVimeoEmbedUrl(demoVideoUrl)}
						className="w-full h-full"
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
					></iframe>
				) : (
					<video src={demoVideoUrl} controls className="w-full h-full" />
				)}
			</div>
		</section>
	);
}
