import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function GET() {
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
  const possiblePaths = [
    path.join(downloadsDir, 'PARAKH.apk'),
    path.join(downloadsDir, 'parakh.apk'),
    path.join(downloadsDir, 'parakh-v1.0.0.apk'),
    path.join(process.cwd(), 'public', 'parakh.apk'),
  ];

  // Also dynamically check if any .apk exists in public/downloads/
  let targetApkPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetApkPath = p;
      break;
    }
  }

  if (!targetApkPath && fs.existsSync(downloadsDir)) {
    const files = fs.readdirSync(downloadsDir);
    const apkFile = files.find((f) => f.toLowerCase().endsWith('.apk'));
    if (apkFile) {
      targetApkPath = path.join(downloadsDir, apkFile);
    }
  }

  if (targetApkPath && fs.existsSync(targetApkPath)) {
    const stat = fs.statSync(targetApkPath);
    const nodeStream = fs.createReadStream(targetApkPath);
    // Convert Node ReadStream to Web ReadableStream for high-performance streaming
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="PARAKH.apk"',
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return new NextResponse(
    JSON.stringify({
      error: 'APK not found in apps/web/public/downloads/',
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
