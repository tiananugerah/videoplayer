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
  togglePlay: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  handleSeek: (time: number) => void;
  handleVideoError: (error: Error) => void;
  setIsLoading: (loading: boolean) => void;
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      handleVideoError(new Error(videoError?.message || 'Terjadi kesalahan saat memuat video'));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
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
    togglePlay,
    handleVolumeChange,
    toggleMute,
    handleSeek,
    handleVideoError,
    setIsLoading
  };
};