'use client';

import { useEffect, useState } from 'react';

interface UseVideoAuthResult {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fetchVideoUrl: (src: string) => Promise<void>;
  getStoredToken: () => string | null;
}

export const useVideoAuth = (): UseVideoAuthResult => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkNetworkConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  };

  const handleAuthError = (error: Error): string => {
    // Pesan error spesifik dari backend
    if (error.message.includes('Token tidak ditemukan')) {
      return 'Token tidak ditemukan. Silakan coba login kembali.';
    } else if (error.message.includes('Format token tidak valid')) {
      return 'Format token tidak valid. Silakan coba login kembali.';
    } else if (error.message.includes('Header Authorization tidak ditemukan')) {
      return 'Header Authorization tidak ditemukan. Pastikan token dikirim dengan benar.';
    } else if (error.message.includes('Token telah kadaluarsa')) {
      return 'Token telah kadaluarsa. Silakan login kembali untuk mendapatkan token baru.';
    }
    // Masalah koneksi ke server
    else if (error.message.includes('Failed to fetch')) {
      return 'Gagal terhubung ke server video. Pastikan server backend berjalan.';
    } 
    // Masalah jaringan
    else if (error.message.includes('NetworkError') || error.message.includes('network')) {
      return 'Terjadi masalah jaringan. Periksa koneksi internet Anda.';
    }
    // Error lainnya
    return error.message || 'Terjadi kesalahan yang tidak diketahui';
  };

  const fetchVideoToken = async (signal: AbortSignal): Promise<{ token: string }> => {
    // Cek apakah token sudah ada di localStorage
    const savedToken = localStorage.getItem('videoToken');
    if (savedToken) {
      console.log('Menggunakan token dari localStorage');
      return { token: savedToken };
    }

    // Gunakan URL yang spesifik untuk endpoint token
    const tokenUrl = 'http://localhost:4000/auth/token';
    console.log('Mengirim request ke:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoidmlkZW8tYWNjZXNzIiwiaWF0IjoxNzQ3NzYxNTE1LCJleHAiOjEwMTc0Nzc2MTUxNH0.VAx5DLscqZ-u-VCyDzfNNzEZ8Ij3tRmFH9xPO7j_bDQ'
      },
      credentials: 'include', // Menambahkan credentials untuk memastikan cookie dikirim
      signal
    });

    console.log('Token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Gagal mendapatkan token: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('Token tidak ditemukan dalam respons server');
    }

    console.log('Token video berhasil diterima:', data.token);
    return data;
  };

  const fetchVideoUrl = async (src: string) => {
    const retries = 3;
    const timeout = 5000;
    
    // Selalu reset state saat memulai fetch baru
    setIsLoading(true);
    setError(null);
    
    // Jika ada videoUrl sebelumnya, bersihkan
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    for (let i = 0; i < retries; i++) {
      try {
        const isOnline = await checkNetworkConnection();
        if (!isOnline) {
          throw new Error('Tidak ada koneksi internet');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const { token } = await fetchVideoToken(controller.signal);
        console.log('Token diperoleh, panjang:', token.length);
        clearTimeout(timeoutId);

        // Simpan token di localStorage untuk penggunaan di seluruh aplikasi
        localStorage.setItem('videoToken', token);

        // Gunakan URL yang spesifik untuk endpoint video
        const videoUrl = src;
        console.log('Mengirim request ke:', videoUrl);
        console.log('Menggunakan format header: Bearer [token]');
        
        // Validasi token sebelum mengirim request
        if (!token || token.trim() === '') {
          throw new Error('Token tidak ditemukan atau kosong. Tidak dapat melakukan autentikasi.');
        }
        
        const videoResponse = await fetch(videoUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'video/mp4, application/json'
          },
          credentials: 'include' // Menambahkan credentials untuk memastikan cookie dikirim
        });

        console.log('Video response:', videoResponse);
        console.log('Video response status:', videoResponse.status);
        
        if (!videoResponse.ok) {
          if (videoResponse.status === 401) {
            // Tampilkan pesan error yang lebih spesifik
            const errorText = await videoResponse.text().catch(() => '');
            console.error('Error 401 detail:', errorText);
            
            // Cek apakah error terkait header Authorization
            if (errorText.includes('Header Authorization tidak ditemukan')) {
              throw new Error('Header Authorization tidak ditemukan. Pastikan token dikirim dengan benar.');
            } else if (errorText.includes('Token tidak ditemukan')) {
              throw new Error('Token tidak ditemukan dalam header Authorization.');
            } else if (errorText.includes('Format token tidak valid')) {
              throw new Error('Format token tidak valid. Pastikan format Bearer digunakan dengan benar.');
            } else {
              throw new Error(`Token tidak valid atau kadaluarsa: ${errorText}`);
            }
          }
          throw new Error(`Gagal mengakses video: ${videoResponse.status} ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        // Membersihkan URL objek sebelumnya jika ada
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        
        // Pastikan blob valid sebelum membuat URL
        if (videoBlob.size === 0) {
          throw new Error('Video yang diterima kosong atau tidak valid');
        }
        
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        console.log('Video URL berhasil dibuat:', videoObjectUrl);
        setVideoUrl(videoObjectUrl);
        setIsLoading(false);
        setError(null); // Reset error state jika berhasil
        return;

      } catch (error) {
        console.error(`Percobaan ${i + 1}/${retries} gagal:`, error);
        const errorMessage = handleAuthError(error instanceof Error ? error : new Error('Kesalahan tidak diketahui'));

        if (i === retries - 1) {
          setError(`Gagal mendapatkan akses video setelah ${retries} percobaan: ${errorMessage}`);
          setIsLoading(false);
        } else {
          const retryDelay = Math.min(1000 * (i + 1), 3000);
          console.log(`Mencoba kembali dalam ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
  };

  // Fungsi untuk mendapatkan token dari localStorage
  const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('videoToken');
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return {
    videoUrl,
    isLoading,
    error,
    fetchVideoUrl,
    getStoredToken
  };
};