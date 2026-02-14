import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig, Img, staticFile } from 'remotion';
import { FadeIn } from '../components/FadeIn';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const glowOpacity = interpolate(
    frame,
    [100, 110, 120],
    [0.5, 0.8, 0.5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: GRADIENTS.heroBg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.body,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at center, rgba(74, 158, 255, 0.08) 0%, transparent 70%)`,
          opacity: glowOpacity,
          transform: 'scale(1.5)',
          zIndex: 0,
        }}
      />

      <div style={{ zIndex: 1, marginBottom: 20 }}>
        <Img
          src={staticFile('logos/mdown.png')}
          style={{
            width: 200,
            height: 200,
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 30px rgba(74, 158, 255, 0.4))',
          }}
        />
      </div>

      <div style={{ zIndex: 1 }}>
        <FadeIn delay={50} duration={30} direction="up" distance={40}>
          <h1
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: 64,
              color: COLORS.textDark,
              margin: 0,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Mdown
          </h1>
        </FadeIn>
      </div>

      <div style={{ zIndex: 1, marginTop: 16 }}>
        <FadeIn delay={70} duration={30} direction="up" distance={30}>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: COLORS.textMedium,
              margin: 0,
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            Web to Markdown, One Click
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
