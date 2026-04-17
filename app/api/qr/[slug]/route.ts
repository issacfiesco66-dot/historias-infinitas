import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * GET /api/qr/[slug]
 * Devuelve el QR PNG del memorial para descarga directa.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const target = `${appUrl}/memorial/${params.slug}`;

  const png = await QRCode.toBuffer(target, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 1024,
    color: { dark: '#2E3440', light: '#FBF9F4' },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${params.slug}.png"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
