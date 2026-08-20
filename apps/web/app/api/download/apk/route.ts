import { NextResponse } from 'next/server';

export async function GET() {
  const dummyApkContent = 'Parakh Mobile App APK Preview File (v1.0.0)';
  return new NextResponse(dummyApkContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="parakh-v1.0.0.apk"',
    },
  });
}
