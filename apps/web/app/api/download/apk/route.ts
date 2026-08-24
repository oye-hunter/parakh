import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Option 1: If an external Cloud Drive / GitHub Release URL is configured
  const cloudUrl = process.env.APK_DOWNLOAD_URL;
  if (cloudUrl) {
    return NextResponse.redirect(cloudUrl, { status: 302 });
  }

  // Option 2: Redirect to Next.js static public file hosted at /downloads/PARAKH.apk
  // This allows Vercel / Next.js CDN to serve the 95MB APK directly with range request & resume support
  const staticApkUrl = new URL('/downloads/PARAKH.apk', request.url);
  return NextResponse.redirect(staticApkUrl, { status: 302 });
}
