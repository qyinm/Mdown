import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { FadeIn } from '../components/FadeIn';
import { SpringScale } from '../components/SpringScale';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

export const PkmScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const fileDrop = spring({
    frame,
    fps,
    from: -300,
    to: 0,
    config: { mass: 0.8, damping: 15 },
  });

  const getBadgeSpring = (delay: number) => {
    return spring({
      frame: frame - delay,
      fps,
      config: { mass: 0.5, damping: 12 },
    });
  };

  const badge1Scale = getBadgeSpring(30);
  const badge2Scale = getBadgeSpring(45);
  const badge3Scale = getBadgeSpring(60);

  const linesProgress = interpolate(
    frame,
    [60, 90],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fileIconStyle: React.CSSProperties = {
    width: 100,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    transform: `translateY(${fileDrop}px)`,
    zIndex: 10,
  };

  const foldStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 30px 30px 0',
    borderColor: `transparent ${COLORS.bgDarkAlt} transparent transparent`, 
    zIndex: 11,
    opacity: 0.2,
  };
  
  const cornerCover: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '0 30px 30px 0',
      borderColor: `#f1f5f9 transparent transparent transparent`, 
      zIndex: 12,
      transform: 'rotate(180deg)', 
      transformOrigin: 'top right'
  };

  const actualFold: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 30,
      height: 30,
      background: 'linear-gradient(225deg, transparent 50%, #e2e8f0 50%)',
      borderBottomLeftRadius: 4,
  };


  const badgeStyle = (scale: number, color: string, bg: string): React.CSSProperties => ({
    transform: `scale(${scale})`,
    opacity: scale > 0.1 ? 1 : 0,
    padding: '12px 24px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 20,
    fontFamily: FONTS.body,
    color: bg === COLORS.notion ? 'white' : COLORS.textDark, 
    backgroundColor: bg === COLORS.notion ? 'transparent' : 'white', 
    border: `2px solid ${color}`,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    boxShadow: `0 4px 12px ${color}40`, 
  });

  const getLineStyle = (angle: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: 150,
    background: `linear-gradient(180deg, ${COLORS.primary} 0%, transparent 100%)`,
    transformOrigin: 'top center',
    transform: `translateX(-50%) rotate(${angle}deg) scaleY(${linesProgress})`,
    opacity: linesProgress,
    zIndex: 5,
  });

  return (
    <AbsoluteFill
      style={{
        background: GRADIENTS.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', marginBottom: 50 }}>
        <div style={{ position: 'absolute', top: 110, left: 50, width: 0, height: 0 }}>
             <div style={getLineStyle(25)} />
             <div style={getLineStyle(0)} />
             <div style={getLineStyle(-25)} />
        </div>

        <div style={fileIconStyle}>
          <div style={actualFold} />
          <span
            style={{
              fontFamily: FONTS.code,
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.primary,
            }}
          >
            .md
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 80,
          marginBottom: 60,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            transform: `scale(${badge1Scale})`,
            opacity: badge1Scale > 0.1 ? 1 : 0,
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 20,
            fontFamily: FONTS.body,
            color: 'white',
            backgroundColor: COLORS.obsidian,
            minWidth: 130,
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
          }}
        >
          Obsidian
        </div>

        <div
          style={{
            transform: `scale(${badge2Scale})`,
            opacity: badge2Scale > 0.1 ? 1 : 0,
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 20,
            fontFamily: FONTS.body,
            color: 'white',
            backgroundColor: COLORS.logseq,
            minWidth: 130,
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)',
          }}
        >
          Logseq
        </div>

        <div
          style={{
            transform: `scale(${badge3Scale})`,
            opacity: badge3Scale > 0.1 ? 1 : 0,
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 20,
            fontFamily: FONTS.body,
            color: 'white',
            backgroundColor: COLORS.notion,
            minWidth: 130,
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          Notion
        </div>
      </div>

      <FadeIn delay={90} duration={20} distance={20} direction="up">
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.white,
            margin: '0 0 16px',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Your PKM. Your files.
        </h2>
      </FadeIn>

      <FadeIn delay={110} duration={20} distance={20} direction="up">
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.primaryLight,
            margin: 0,
            textAlign: 'center',
          }}
        >
          Local-first.
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
};