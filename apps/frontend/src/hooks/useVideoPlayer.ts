'use client';

import { useRef, useState, useEffect } from 'react';

interface UseVideoPlayerResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  buffered: TimeRanges | null;
  playbackRate: number;
  togglePlay: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  handleSeek: (time: number) => void;
  handleVideoError: (error: Error) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

export const useVideoPlayer = (src?: string): UseVideoPlayerResult => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isNaN(video.currentTime)) {
        setCurrentTime(video.currentTime);
        setBuffered(video.buffered);
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(video.duration)) {
        setDuration(video.duration);
        setCurrentTime(0);
      }
      setIsLoading(false);
      setError(null);
    };

    const handleDurationChange = () => {
      if (!isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      handleVideoError(new Error(videoError?.message || 'Terjadi kesalahan saat memuat video'));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', () => setBuffered(video.buffered));
    video.addEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
    video.addEventListener('seeking', handleTimeUpdate);
    video.addEventListener('seeked', handleTimeUpdate);

    // Coba dapatkan durasi jika sudah tersedia
    if (!isNaN(video.duration)) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    video.removeEventListener('durationchange', handleDurationChange);
    video.removeEventListener('loadstart', handleLoadStart);
    video.removeEventListener('loadeddata', handleLoadedData);
    video.removeEventListener('error', handleError);
    video.removeEventListener('progress', () => setBuffered(video.buffered));
    video.removeEventListener('ratechange', () => setPlaybackRate(video.playbackRate));
    video.removeEventListener('seeking', handleTimeUpdate);
    video.removeEventListener('seeked', handleTimeUpdate);
    };
  }, [src]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setError(null);
        
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
          try {
            await Promise.race([
              videoRef.current.play(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout saat memuat video')), 10000)
              )
            ]);
            setIsPlaying(true);
            break;
          } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    } catch (error) {
      handleVideoError(error instanceof Error ? error : new Error('Gagal memutar video'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVideoError = (error: Error) => {
    setIsPlaying(false);
    setIsLoading(false);
    setError(error.message);
    console.error('Error video player:', error);
  };

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    buffered,
    playbackRate,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handleSeek,
    handleVideoError,
    setIsLoading,
    setPlaybackRate
  };
};