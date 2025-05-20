'use client';

import { useVideoContext } from './VideoContext';

interface VideoOverlayProps {
  watermark?: string;
}

export const VideoOverlay = ({ watermark }: VideoOverlayProps) => {
  const { isPlaying } = useVideoContext();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Watermark */}
      {watermark && (
        <div className="absolute top-4 left-4 text-white/50 text-lg font-semibold">
          {watermark}
        </div>
      )}

      {/* Play indicator */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isPlaying ? 'opacity-0' : 'opacity-100 bg-black/40'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};