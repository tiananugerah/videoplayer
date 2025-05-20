import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect dari root path ke halaman video
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/video', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/']
};