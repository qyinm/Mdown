import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FadeIn } from '../components/FadeIn';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

const RedX: React.FC<{ delay: number; style?: React.CSSProperties }> = ({ delay, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { mass: 0.5, damping: 10, stiffness: 200 },
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        transform: `scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        ...style,
      }}
    >
      <div
        style={{
          color: COLORS.error,
          fontSize: 60,
          fontWeight: 900,
          fontFamily: FONTS.heading,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          textShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
        }}
      >
        ✕
      </div>
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { mass: 0.8, damping: 15 },
    from: 1500,
    to: 0,
  });

  const { height } = useVideoConfig();

  const slideOut = interpolate(frame, [90, 110], [0, -height * 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardY = slideIn + slideOut;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgLight,
        fontFamily: FONTS.body,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translateY(${cardY}px)`,
          padding: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '90%',
            height: '75%',
            background: COLORS.white,
            borderRadius: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              height: 80,
              background: '#f1f5f9',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ width: 40, height: 40, background: '#cbd5e1', borderRadius: 8 }} />
            <div style={{ width: 120, height: 20, background: '#cbd5e1', borderRadius: 4 }} />
          </div>
          <RedX delay={20} style={{ top: 10, left: '50%', marginLeft: -30 }} />

          <div style={{ display: 'flex', height: 'calc(100% - 80px)' }}>
            <div style={{ flex: 1, padding: 24, position: 'relative' }}>
              <div
                style={{
                  height: 120,
                  background: '#ffedd5',
                  border: '2px dashed #f97316',
                  borderRadius: 12,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c2410c',
                  fontWeight: 'bold',
                }}
              >
                ADVERTISEMENT
              </div>
              <RedX delay={28} style={{ top: 60, left: '50%', marginLeft: -30 }} />

              {[100, 90, 95, 80, 85, 40].map((width, i) => (
                <div
                  key={i}
                  style={{
                    height: 16,
                    width: `${width}%`,
                    background: '#e2e8f0',
                    marginBottom: 16,
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                width: 200,
                background: '#f8fafc',
                borderLeft: `1px solid ${COLORS.border}`,
                padding: 16,
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: 300,
                  background: '#ffedd5',
                  border: '2px dashed #f97316',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c2410c',
                  fontWeight: 'bold',
                }}
              >
                AD
              </div>
              <RedX delay={36} style={{ top: 150, left: '50%', marginLeft: -30 }} />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'rgba(15, 23, 42, 0.95)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ width: '80%', height: 12, background: '#475569', borderRadius: 4 }} />
            <div style={{ width: 120, height: 40, background: COLORS.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 14 }}>
              Accept Cookies
            </div>
            <RedX delay={44} style={{ bottom: 40, left: '50%', marginLeft: -30 }} />
          </div>
        </div>
      </AbsoluteFill>

      {frame >= 50 && (
        <AbsoluteFill
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `translateY(${slideOut}px)`,
          }}
        >
          <FadeIn delay={50} duration={20}>
            <h2
              style={{
                fontFamily: FONTS.heading,
                fontSize: 64,
                fontWeight: 800,
                color: COLORS.white,
                textAlign: 'center',
                maxWidth: '80%',
                lineHeight: 1.2,
              }}
            >
              Web pages are <br />
              <span style={{ color: COLORS.error }}>messy.</span>
            </h2>
          </FadeIn>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
