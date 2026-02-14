import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { COLORS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

interface PopupMockupProps {
  status?: 'idle' | 'loading' | 'copied' | 'saved';
  animate?: boolean;
  delay?: number;
  style?: React.CSSProperties;
}

export const PopupMockup: React.FC<PopupMockupProps> = ({
  status = 'idle',
  animate = true,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const translateY = animate
    ? spring({
        frame: frame - delay,
        fps,
        from: -50,
        to: 0,
        config: { mass: 0.5, damping: 12 },
      })
    : 0;

  const opacity = animate
    ? interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <div
      style={{
        width: 280, 
        padding: 24,
        background: COLORS.white,
        borderRadius: 16,
        boxShadow: `0 10px 40px -5px ${COLORS.shadow}, 0 0 1px ${COLORS.borderDark}`,
        fontFamily: FONTS.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      <h1
        style={{
          margin: '0 0 8px',
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.textDark,
          fontFamily: FONTS.heading,
        }}
      >
        Mdown
      </h1>
      <p
        style={{
          margin: '0 0 20px',
          color: COLORS.textMedium,
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        Save this page as Markdown
      </p>

      <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 8 }}>
        <button
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'white',
            background: COLORS.primary,
            opacity: status === 'loading' ? 0.7 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {status === 'loading' ? '...' : 'Copy'}
        </button>

        <button
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            color: COLORS.textDark,
            background: '#e5e7eb',
            opacity: status === 'loading' ? 0.7 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {status === 'loading' ? '...' : 'Save'}
        </button>
      </div>

      {status === 'copied' && (
        <p style={{ marginTop: 12, color: COLORS.success, fontSize: 14, fontWeight: 500 }}>
          Copied to clipboard!
        </p>
      )}
      {status === 'saved' && (
        <p style={{ marginTop: 12, color: COLORS.success, fontSize: 14, fontWeight: 500 }}>
          Saved successfully!
        </p>
      )}
    </div>
  );
};
