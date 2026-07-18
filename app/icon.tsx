import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Next.js's file-based icon convention: this renders automatically as the
// site favicon/app icon at request time via next/og, so it always matches
// the badge mark used across Navbar/Footer/auth pages without needing a
// separately maintained static PNG.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #c2410c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span style={{ color: 'white', fontSize: 38, fontWeight: 800 }}>S</span>
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
            <path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
