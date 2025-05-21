'use client';

import { createContext, useContext } from 'react';

interface VideoContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  buffered: TimeRanges | null;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  togglePlay: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  handleSeek: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoContext = createContext<VideoContextType | null>(null);

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoContextProvider');
  }
  return context;
};