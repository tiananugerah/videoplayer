/**
 * Utilitas untuk menangani request API dengan header Authorization
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Fungsi untuk melakukan request API dengan header Authorization
 */
export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Siapkan headers default
  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  
  // Tambahkan header Authorization jika diperlukan
  if (requiresAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('videoToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  // Lakukan request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Pastikan cookies dikirim
  });
  
  // Tangani respons
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }
  
  // Kembalikan data jika ada
  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  }
  
  return response as unknown as T;
}