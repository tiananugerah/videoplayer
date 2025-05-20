'use client';

import { useVideoAuth } from '@/hooks/useVideoAuth';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { VideoControls } from './VideoControls';
import { VideoOverlay } from './VideoOverlay';
import { VideoContext } from './VideoContext';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface VideoPlayerProps {
  src?: string;
  watermark?: string;
}

export const VideoPlayer = ({ 
  src = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:4000/video',
  watermark = 'Video Player'
}: VideoPlayerProps) => {
  const { videoUrl, isLoading: authLoading, error, fetchVideoUrl } = useVideoAuth();
  const videoPlayer = useVideoPlayer(src);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsVideoLoaded(false);
    fetchVideoUrl(src);
  }, [src, fetchVideoUrl]);

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  const renderLoadingState = () => (
    <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black group">
      <div className={styles.videoSkeleton} />
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <div className="text-white text-lg font-medium z-10">
          Memuat video...
        </div>
      </div>
    </div>
  );

  if (!videoUrl && authLoading) {
    return renderLoadingState();
  }

  if (videoUrl && !isVideoLoaded) {
    return (
      <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black group">
        {renderLoadingState()}
        <video
          ref={videoPlayer.videoRef}
          className="w-full h-auto opacity-0"
          src={videoUrl}
          onLoadedData={() => {
            videoPlayer.setIsLoading(false);
            setIsVideoLoaded(true);
          }}
        />
      </div>
    );
  }

  return (
    <VideoContext.Provider value={videoPlayer}>
      <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black group">
        <video
          ref={videoPlayer.videoRef}
          className={`w-full h-auto ${styles.fadeIn}`}
          src={videoUrl || ''}
          onClick={videoPlayer.togglePlay}
          onLoadedData={() => videoPlayer.setIsLoading(false)}
          controls={false}
          playsInline
        />
        <VideoOverlay watermark={watermark} />
        {!videoPlayer.isLoading && <VideoControls />}
      </div>
    </VideoContext.Provider>
  );
};
