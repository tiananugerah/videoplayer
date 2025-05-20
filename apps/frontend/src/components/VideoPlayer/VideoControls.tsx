'use client';

import { useVideoContext } from './VideoContext';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export const VideoControls = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handleSeek,
  } = useVideoContext();

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 group-hover:opacity-100">
      {/* Progress bar */}
      <div className="relative w-full h-1 mb-4 bg-gray-600 rounded cursor-pointer group">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute h-full bg-primary rounded"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="p-2 text-white hover:text-primary transition-colors"
          >
            {isPlaying ? (
              <FaPause className="w-5 h-5" />
            ) : (
              <FaPlay className="w-5 h-5" />
            )}
          </button>

          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:text-primary transition-colors"
            >
              {isMuted || volume === 0 ? (
                <FaVolumeMute className="w-5 h-5" />
              ) : (
                <FaVolumeUp className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>

          {/* Time display */}
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};