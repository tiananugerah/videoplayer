'use client';

import { useVideoContext } from './VideoContext';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaCog } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

export const VideoControls = () => {
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        settingsButtonRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    buffered,
    playbackRate,
    setPlaybackRate,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handleSeek,
    videoRef,
  } = useVideoContext();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error saat mengubah mode fullscreen:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDoubleClick = () => {
      toggleFullscreen();
    };

    video.addEventListener('dblclick', handleDoubleClick);
    return () => {
      video.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [videoRef]);

  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef} 
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300 ${isControlsVisible || isInteracting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      onMouseEnter={() => {
        setIsControlsVisible(true);
        if (hideControlsTimeout.current) {
          clearTimeout(hideControlsTimeout.current);
        }
      }}
      onMouseLeave={() => {
        if (!isInteracting) {
          hideControlsTimeout.current = setTimeout(() => {
            setIsControlsVisible(false);
          }, 2000);
        }
      }}
      onClick={() => {
        setIsInteracting(!isInteracting);
        setIsControlsVisible(true);
        if (!isInteracting) {
          if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
          }
        } else {
          hideControlsTimeout.current = setTimeout(() => {
            setIsControlsVisible(false);
            setIsInteracting(false);
          }, 2000);
        }
      }}
    >
      {/* Progress bar */}
      <div 
        className="relative w-full h-1 mb-4 bg-gray-600 rounded cursor-pointer group"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          const previewTime = percent * duration;
          // TODO: Implementasi preview thumbnail di sini
        }}
      >
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Buffered progress */}
        {buffered && buffered.length > 0 && Array.from(Array(buffered.length)).map((_, index) => (
          <div
            key={index}
            className="absolute h-full bg-gray-400 rounded"
            style={{
              left: `${(buffered.start(index) / duration) * 100}%`,
              width: `${((buffered.end(index) - buffered.start(index)) / duration) * 100}%`
            }}
          />
        ))}
        {/* Playback progress */}
        <div
          className="absolute h-full bg-primary rounded z-20"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        {/* Hover preview */}
        <div className="absolute bottom-4 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(currentTime)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="p-2 text-white hover:text-primary transition-colors"
          >
            {isPlaying ? (
              <FaPause size={20} />
            ) : (
              <FaPlay size={20} />
            )}
          </button>

          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:text-primary transition-colors"
            >
              {isMuted || volume === 0 ? (
                <FaVolumeMute size={20} />
              ) : (
                <FaVolumeUp size={20} />
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

          {/* Playback Speed */}
          <div className="relative">
            <button
              ref={settingsButtonRef}
              className="p-2 text-white hover:text-primary transition-colors"
              aria-label="Pengaturan"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              onMouseEnter={() => setIsSettingsVisible(true)}
              onMouseLeave={() => {
                if (!isSettingsOpen) {
                  setIsSettingsVisible(false);
                }
              }}
            >
              <FaCog className={`w-5 h-5 transition-transform duration-300 ${(isSettingsVisible || isSettingsOpen) ? 'rotate-180' : ''}`} />
            </button>
            <div 
              ref={settingsRef}
              className={`absolute bottom-full left-0 mb-2 bg-black/90 rounded-lg p-2 transition-all duration-300 ${(isSettingsVisible || isSettingsOpen) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
              onMouseEnter={() => setIsSettingsVisible(true)}
              onMouseLeave={() => {
                if (!isSettingsOpen) {
                  setIsSettingsVisible(false);
                }
              }}
            >
              <div className="text-white text-sm font-medium mb-2">Kecepatan Pemutaran</div>
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`block w-full text-left px-3 py-1 text-sm ${playbackRate === rate ? 'text-primary' : 'text-white'} hover:bg-gray-700 rounded`}
                >
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:text-primary transition-colors ml-4"
          >
            {isFullscreen ? (
              <FaCompress className="w-5 h-5" />
            ) : (
              <FaExpand className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};