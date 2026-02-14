import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';
import { TypeWriter } from '../components/TypeWriter';
import { SpringScale } from '../components/SpringScale';
import { FadeIn } from '../components/FadeIn';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulseScale = interpolate(
    Math.sin((frame - 70) * 0.15),
    [-1, 1],
    [1.0, 1.03],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const finalButtonScale = frame > 70 ? pulseScale : 1;

  return (
    <AbsoluteFill
      style={{
        background: GRADIENTS.ctaBg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.body,
        gap: 32,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <Img
          src={staticFile('logos/mdown.png')}
          style={{
            width: 150,
            height: 150,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 30px rgba(74, 158, 255, 0.3))',
          }}
        />
      </div>

      <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
        <TypeWriter
          text="Web to Markdown, One Click"
          startFrame={20}
          speed={1.5}
          style={{
            color: COLORS.textDark,
            fontSize: 28,
            fontWeight: 500,
            fontFamily: FONTS.code,
          }}
          cursorColor={COLORS.primary}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <SpringScale delay={40} mass={0.8} damping={15}>
          <div style={{ transform: `scale(${finalButtonScale})` }}>
            <button
              style={{
                background: COLORS.primary,
                border: 'none',
                borderRadius: 50,
                padding: '18px 48px',
                color: COLORS.white,
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FONTS.heading,
                cursor: 'pointer',
                boxShadow: `0 0 30px ${COLORS.primaryGlow}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                outline: 'none',
              }}
            >
              Install Free 
              <span style={{ fontSize: 24, lineHeight: 1 }}>→</span>
            </button>
          </div>
        </SpringScale>
      </div>

      <div style={{ position: 'absolute', bottom: 120 }}>
        <FadeIn delay={80} duration={30} direction="up" distance={20}>
          <p
            style={{
              color: COLORS.textLight,
              fontSize: 16,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: 0.8,
            }}
          >
            Available on Chrome Web Store
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
