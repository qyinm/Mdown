import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from 'remotion';
import { FadeIn } from '../components/FadeIn';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

// Inner orbit: PKM tools
const INNER_ITEMS = [
  { name: 'obsidian', color: COLORS.obsidian, angle: 0 },
  { name: 'logseq', color: COLORS.logseq, angle: 120 },
  { name: 'notion', color: COLORS.notion, angle: 240 },
];

// Outer orbit: AI tools  
const OUTER_ITEMS = [
  { name: 'gemini', color: COLORS.gemini, angle: 60 },
  { name: 'openai', color: COLORS.openai, angle: 180 },
  { name: 'claude', color: COLORS.claude, angle: 300 },
];

export const OrbitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Orbit rotation speeds
  const innerSpeed = 0.6; // degrees per frame
  const outerSpeed = 0.8; // degrees per frame
  
  // Inner radius: 180px, Outer radius: 300px
  const innerRadius = 180;
  const outerRadius = 300;

  // Spring animations for logo entrance
  const getSpringScale = (delay: number) => {
    return spring({
      frame: frame - delay,
      fps,
      config: { mass: 0.5, damping: 12 },
    });
  };

  // Inner items entrance: frames 15, 25, 35
  const innerScales = [15, 25, 35].map(getSpringScale);
  // Outer items entrance: frames 45, 55, 65
  const outerScales = [45, 55, 65].map(getSpringScale);

  // Text phase opacity
  const phase1Opacity = interpolate(
    frame,
    [60, 80, 120, 140],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const phase2Opacity = interpolate(
    frame,
    [130, 150],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: GRADIENTS.primaryBg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Center content container */}
      <div style={{ position: 'relative', width: 700, height: 700 }}>
        
        {/* Inner orbit track */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.06)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Outer orbit track */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: outerRadius * 2,
            height: outerRadius * 2,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.06)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Inner orbit items */}
        {INNER_ITEMS.map((item, index) => {
          const rotation = item.angle + frame * innerSpeed;
          const scale = innerScales[index];
          
          return (
            <div
              key={item.name}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 72,
                height: 72,
                marginLeft: -36,
                marginTop: -36,
                transform: `
                  rotate(${rotation}deg) 
                  translateX(${innerRadius}px) 
                  rotate(-${rotation}deg)
                  scale(${scale})
                `,
                transformOrigin: 'center center',
                opacity: scale > 0.1 ? 1 : 0,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: `3px solid ${item.color}`,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 0 20px ${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile(`logos/${item.name}.svg`)}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              </div>
            </div>
          );
        })}

        {/* Outer orbit items */}
        {OUTER_ITEMS.map((item, index) => {
          const rotation = item.angle + frame * outerSpeed;
          const scale = outerScales[index];
          
          return (
            <div
              key={item.name}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 64,
                height: 64,
                marginLeft: -32,
                marginTop: -32,
                transform: `
                  rotate(${rotation}deg) 
                  translateX(${outerRadius}px) 
                  rotate(-${rotation}deg)
                  scale(${scale})
                `,
                transformOrigin: 'center center',
                opacity: scale > 0.1 ? 1 : 0,
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: `3px solid ${item.color}`,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 0 20px ${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile(`logos/${item.name}.svg`)}
                  style={{ width: 40, height: 40, objectFit: 'contain' }}
                />
              </div>
            </div>
          );
        })}

        {/* Central Mdown Logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${getSpringScale(0)})`,
            zIndex: 30,
            filter: 'drop-shadow(0 0 30px rgba(74, 158, 255, 0.4))',
          }}
        >
          <Img src={staticFile('logos/mdown.png')} style={{ width: 120, height: 120, objectFit: 'contain' }} />
        </div>
      </div>

      {/* Text Area */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        {/* Phase 1: "Your PKM. Your AI." */}
        <div style={{ opacity: phase1Opacity }}>
          <h2
            style={{
              fontFamily: FONTS.heading,
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.textDark,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            Your PKM. Your AI.
          </h2>
        </div>

        {/* Phase 2: "Web blocked? Just paste it." */}
        <div style={{ opacity: phase2Opacity }}>
          <h2
            style={{
              fontFamily: FONTS.heading,
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.textDark,
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            Web blocked? Just paste it.
          </h2>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              fontWeight: 500,
              color: COLORS.primary,
              margin: 0,
            }}
          >
            AI web fetch blocked? Mdown makes it easy.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
