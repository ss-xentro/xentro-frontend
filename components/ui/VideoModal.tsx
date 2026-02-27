'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[7].length === 11 ? match[7] : null;
  // adding autoplay=1 & mute=0 typically to force autoplay if allowed
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isYouTube = videoUrl.includes('youtube') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo');
  const isIframe = isYouTube || isVimeo;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    // Escape to close
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // If it's an iframe (YouTube/Vimeo), native JS video controls won't work easily
    // due to cross-origin policies without the specific Player APIs. This bindings
    // primarily target standard <video> tags.
    if (!videoRef.current || isIframe) return;

    const video = videoRef.current;

    switch (e.key) {
      case ' ': // Space
      case 'Spacebar':
        e.preventDefault(); // Prevent page scrolling
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        break;
    }
  }, [isOpen, onClose, isIframe]);

  useEffect(() => {
    if (isOpen) {
      // Add listener
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Autoplay native video element if it's rendered
      if (videoRef.current && !isIframe) {
        videoRef.current.play().catch(e => console.error("Autoplay prevented:", e));
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, isIframe]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 focus:outline-hidden"
        aria-label="Close video"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video Container */}
      <div
        className="relative w-full max-w-5xl aspect-video mx-4 shadow-2xl rounded-2xl overflow-hidden bg-black ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside video from closing modal
      >
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : isVimeo ? (
          <iframe
            src={getVimeoEmbedUrl(videoUrl)}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full object-contain"
            autoPlay
          />
        )}
      </div>

      {/* Keyboard hints */}
      {!isIframe && (
        <div className="absolute bottom-8 text-white/50 text-sm hidden md:flex items-center gap-6">
          <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/10 rounded-md">Space</kbd> Play / Pause</span>
          <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/10 rounded-md">←</kbd> <kbd className="px-2 py-1 bg-white/10 rounded-md">→</kbd> Seek 5s</span>
          <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-white/10 rounded-md">↑</kbd> <kbd className="px-2 py-1 bg-white/10 rounded-md">↓</kbd> Volume</span>
        </div>
      )}
    </div>,
    document.body
  );
}
