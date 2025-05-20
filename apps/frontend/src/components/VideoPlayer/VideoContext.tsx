'use client';

import { createContext, useContext } from 'react';

interface VideoContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  togglePlay: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  handleSeek: (time: number) => void;
}

export const VideoContext = createContext<VideoContextType | null>(null);

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoContextProvider');
  }
  return context;
};