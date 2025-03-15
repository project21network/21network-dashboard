import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname, searchParams } = url;

  // Przekierowanie /__/auth/handler do /auth/firebase-handler
  if (pathname.startsWith('/__/auth/handler')) {
    url.pathname = '/auth/firebase-handler';
    return NextResponse.redirect(url);
  }

  // Przekierowanie /__/auth/action do /auth/firebase-action
  if (pathname.startsWith('/__/auth/action')) {
    url.pathname = '/auth/firebase-action';
    return NextResponse.redirect(url);
  }

  // Przekierowanie innych ścieżek /__/auth/* do /auth/firebase-handler
  if (pathname.startsWith('/__/auth/')) {
    // Sprawdź, czy to jest akcja (resetowanie hasła, weryfikacja email)
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    if (mode && oobCode) {
      url.pathname = '/auth/firebase-action';
    } else {
      url.pathname = '/auth/firebase-handler';
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/__/auth/:path*'],
};