import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

interface MdownLogoProps {
  size?: number;
  animate?: boolean;
  delay?: number;
  showShimmer?: boolean;
  style?: React.CSSProperties;
}

export const MdownLogo: React.FC<MdownLogoProps> = ({
  size = 200,
  animate = true,
  delay = 0,
  showShimmer = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = animate
    ? spring({
        frame: frame - delay,
        fps,
        config: { mass: 0.8, damping: 15, stiffness: 150 },
      })
    : 1;

  const shimmerStart = delay + 15; 
  const shimmerProgress = interpolate(
    frame,
    [shimmerStart, shimmerStart + 45],
    [-1, 2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `scale(${scale})`,
    ...style,
  };

  const logoStyle: React.CSSProperties = {
    fontFamily: FONTS.heading,
    fontWeight: 900,
    fontSize: size * 0.8,
    lineHeight: 1,
    color: 'transparent',
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primaryDark} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    position: 'relative',
    letterSpacing: '-0.05em',
    filter: 'drop-shadow(0 10px 20px rgba(74, 158, 255, 0.3))',
  };

  const glassStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    borderRadius: size * 0.2,
    pointerEvents: 'none',
  };

  const arrowSize = size * 0.4;
  
  return (
    <div style={containerStyle}>
      <div style={logoStyle}>
        M
        {showShimmer && animate && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)`,
              transform: `translateX(${shimmerProgress * 100}%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          right: size * 0.12,
          bottom: size * 0.15,
          width: arrowSize,
          height: arrowSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4V20M12 20L5 13M12 20L19 13"
            stroke={COLORS.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: -size * 0.2,
          background: `radial-gradient(circle, ${COLORS.primaryGlow} 0%, transparent 70%)`,
          zIndex: -1,
          opacity: 0.6,
        }}
      />
    </div>
  );
};
