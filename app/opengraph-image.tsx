import { ImageResponse } from 'next/og';

// Next.js genera /opengraph-image automáticamente a partir de este archivo.
// Se convierte en la imagen por defecto para Open Graph + Twitter.
// Dimensiones estándar 1200x630.

export const runtime = 'edge';
export const alt = 'Historias Infinitas — Nichos Virtuales eternos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1F242E 0%, #2B3240 55%, #B7945A 100%)',
          color: '#F4EFE4',
          fontFamily: 'serif',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* Halo dorado */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(183,148,90,0.35) 0%, transparent 70%)',
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 20,
            letterSpacing: 12,
            textTransform: 'uppercase',
            color: '#E2CC99',
            marginBottom: 40,
            zIndex: 1,
          }}
        >
          En memoria eterna
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 108,
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.05,
            zIndex: 1,
          }}
        >
          Historias Infinitas
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontStyle: 'italic',
            color: '#F4EFE4',
            opacity: 0.8,
            marginTop: 40,
            maxWidth: 900,
            textAlign: 'center',
            lineHeight: 1.4,
            zIndex: 1,
          }}
        >
          Nichos Virtuales con IA y Realidad Aumentada
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 16,
            fontSize: 16,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#B7945A',
          }}
        >
          <span>Mascotas</span>
          <span>·</span>
          <span>Seres queridos</span>
          <span>·</span>
          <span>Eternos</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
