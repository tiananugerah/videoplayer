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
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  // Efek untuk menangani perubahan src dan memuat video
  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      if (!isMounted) return;
      
      try {
        // Set loading state tanpa mengubah tampilan video yang ada
        if (!isVideoLoaded) {
          videoPlayer.setIsLoading(true);
        }
        
        // Fetch video URL
        await fetchVideoUrl(src);
        
        if (!isMounted) return;
        console.log('Proses fetch video URL selesai');
      } catch (error) {
        if (!isMounted) return;
        console.error('Error saat memuat video:', error);
        videoPlayer.handleVideoError(error instanceof Error ? error : new Error('Gagal memuat video'));
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      // Membersihkan URL objek saat komponen unmount
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);
  
  // Efek untuk menangani perubahan videoUrl dan mempersiapkan video
  useEffect(() => {
    if (videoUrl) {
      // Reset state saat URL video berubah
      setIsVideoLoaded(false);
      setIsVideoVisible(false);
      console.log('URL video tersedia, mempersiapkan video baru');
      
      // Buat element video untuk preloading
      const preloadVideo = document.createElement('video');
      preloadVideo.src = videoUrl;
      preloadVideo.load();
      
      // Tangani event loading
      const handlePreload = () => {
        handleVideoLoaded();
        preloadVideo.removeEventListener('loadeddata', handlePreload);
      };
      
      preloadVideo.addEventListener('loadeddata', handlePreload);
      
      return () => {
        preloadVideo.removeEventListener('loadeddata', handlePreload);
        preloadVideo.src = '';
      };
    }
  }, [videoUrl]);


  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  const renderLoadingState = () => (
    <div className={`relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black group ${styles.fadeIn}`}>
      <div className={styles.videoSkeleton} />
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <div className="text-white text-lg font-medium z-10">
          Memuat video...
        </div>
      </div>
    </div>
  );

  const handleVideoLoaded = () => {
    console.log('Video berhasil dimuat');
    videoPlayer.setIsLoading(false);
    setIsVideoLoaded(true);
    
    // Gunakan single requestAnimationFrame untuk transisi yang lebih halus
    requestAnimationFrame(() => {
      if (videoPlayer.videoRef.current) {
        setIsVideoVisible(true);
        console.log('Video sekarang ditampilkan');
      }
    });
  };

  // Jangan render ulang komponen utama jika belum ada videoUrl atau masih dalam proses autentikasi
  // Ini akan ditangani di dalam render utama dengan kondisi yang lebih halus
  // Kita hanya menampilkan pesan error jika ada, tapi tidak merender ulang seluruh komponen
  // untuk mencegah kedipan

  // Gunakan VideoContext.Provider untuk semua kondisi render
  return (
    <VideoContext.Provider value={videoPlayer}>
      <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black group">
        {/* Container untuk video dengan transisi halus */}
        <div className={`${styles.videoTransition} ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
          {videoUrl && (
            <>
              <video
                ref={videoPlayer.videoRef}
                className="w-full h-auto"
                src={videoUrl}
                onClick={videoPlayer.togglePlay}
                onLoadedData={() => {
                  console.log('Video element berhasil memuat data');
                  videoPlayer.setIsLoading(false);
                  // Panggil handleVideoLoaded hanya jika video belum dimuat
                  if (!isVideoLoaded) {
                    handleVideoLoaded();
                  }
                }}
                onError={(e) => {
                  console.error('Error pada video yang sudah dimuat:', e);
                  videoPlayer.handleVideoError(new Error('Terjadi kesalahan saat memutar video'));
                }}
                controls={false}
                playsInline
              />
              <VideoOverlay watermark={watermark} />
              {!videoPlayer.isLoading && <VideoControls />}
            </>
          )}
        </div>
        
        {/* Tampilkan loading state jika video belum dimuat */}
        {(!isVideoLoaded || !isVideoVisible || authLoading) && renderLoadingState()}
        
        {/* Video tersembunyi untuk preloading saat URL berubah */}
        {videoUrl && !isVideoLoaded && (
          <div className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden="true">
            <video
              src={videoUrl}
              onLoadedData={handleVideoLoaded}
              onError={(e) => {
                console.error('Error saat memuat video element:', e);
                setIsVideoLoaded(false);
                setIsVideoVisible(false);
                videoPlayer.handleVideoError(new Error('Gagal memuat video'));
              }}
              style={{ visibility: 'hidden' }}
              playsInline
            />
          </div>
        )}
      </div>
    </VideoContext.Provider>
  );

};
