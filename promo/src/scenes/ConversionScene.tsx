import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Img, staticFile } from 'remotion';
import { BrowserMockup } from '../components/BrowserMockup';
import { PopupMockup } from '../components/PopupMockup';
import { CodeBlock } from '../components/CodeBlock';
import { MarkdownBlock } from '../components/MarkdownBlock';
import { SpringScale } from '../components/SpringScale';
import { COLORS, GRADIENTS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

export const ConversionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase A: Browser + Popup (0-90)
  const browserSlide = spring({
    frame: frame,
    fps,
    from: height,
    to: 0,
    config: { mass: 0.8, damping: 15 },
  });

  const browserOpacity = interpolate(
    frame,
    [90, 110],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const browserScale = interpolate(
    frame,
    [90, 110],
    [1, 0.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fake cursor animation - clicks extension icon in address bar
  // Browser is centered, 1200px wide. Icon is at right side of address bar.
  const browserCenterX = width / 2;
  const browserLeftX = browserCenterX - 600; // 1200/2
  const extensionIconX = browserLeftX + 1160; // Near right edge of address bar
  const extensionIconY = height / 2 - 325 + 20; // In the toolbar area (browser top is at height/2 - 325)
  
  const cursorX = interpolate(
    frame,
    [30, 50],
    [width / 2, extensionIconX],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t) }
  );
  
  const cursorY = interpolate(
    frame,
    [30, 50],
    [height / 2 + 200, extensionIconY],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t) }
  );

  const cursorClick = interpolate(
    frame,
    [50, 55, 60],
    [1, 0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cursorOpacity = interpolate(
    frame,
    [80, 90],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Popup animation - appears after clicking extension icon
  const showPopup = frame > 55;
  const popupStatus = frame > 75 ? 'saved' : 'idle';

  // Phase B: Split View (90-250)
  const leftPanelX = interpolate(
    frame,
    [110, 130],
    [-width / 2 - 500, -20], // Slight gap from center
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t) }
  );

  const rightPanelX = interpolate(
    frame,
    [110, 130],
    [width / 2 + 500, 20],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t) }
  );

  // Phase C: Success (250-300)
  const successSlide = interpolate(
    frame,
    [250, 280],
    [0, 40], // Move panels further apart
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const finalFadeOut = interpolate(
    frame,
    [280, 300],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const arrowScale = spring({
    frame: frame - 130,
    fps,
    config: { mass: 0.5 },
  });

  const renderCheck = (delay: number, text: string) => {
    const scale = spring({
      frame: frame - delay,
      fps,
      config: { mass: 0.5, damping: 10 },
    });
    
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: frame > delay ? 1 : 0,
          color: COLORS.success,
          fontSize: 32,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          marginBottom: 16,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 36 }}>✓</span> {text}
      </div>
    );
  };

  const htmlCode = `<h1>Getting Started</h1>
<p>Learn how to build modern
web applications with our
comprehensive guide.</p>
<a href="/docs">Read more</a>
<img src="hero.png" alt="Hero">`;

  const mdLines = [
    { type: 'h1' as const, text: 'Getting Started' },
    { type: 'p' as const, text: 'Learn how to build modern web applications with our comprehensive guide.' },
    { type: 'link' as const, text: 'Read more → /docs' },
    { type: 'image' as const, text: 'Hero' }
  ];

  const bgGradient = `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.bgLight} 100%)`;

  return (
    <AbsoluteFill style={{ background: bgGradient, opacity: finalFadeOut }}>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: browserOpacity,
          transform: `scale(${browserScale})`,
        }}
      >
        <div style={{ position: 'relative' }}>
          <BrowserMockup
            url="https://example.com/getting-started"
            style={{
              transform: `translateY(${browserSlide}px)`,
              width: 1200,
              height: 650,
            }}
          >
            <div style={{ padding: 40, display: 'flex', gap: 40, height: '100%' }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '80%', height: 32, background: COLORS.textDark, marginBottom: 24, borderRadius: 4, opacity: 0.8 }} />
                <div style={{ width: '100%', height: 14, background: COLORS.textLight, marginBottom: 10, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '95%', height: 14, background: COLORS.textLight, marginBottom: 10, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '90%', height: 14, background: COLORS.textLight, marginBottom: 10, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '98%', height: 14, background: COLORS.textLight, marginBottom: 10, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '60%', height: 14, background: COLORS.textLight, marginBottom: 30, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '100%', height: 200, background: '#e2e8f0', borderRadius: 8 }} />
              </div>
              <div style={{ width: 300 }}>
                <div style={{ width: '100%', height: 180, background: '#e2e8f0', borderRadius: 8, marginBottom: 20 }} />
                <div style={{ width: '100%', height: 14, background: COLORS.textLight, marginBottom: 8, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '90%', height: 14, background: COLORS.textLight, marginBottom: 8, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ width: '85%', height: 14, background: COLORS.textLight, borderRadius: 4, opacity: 0.3 }} />
              </div>
            </div>
          </BrowserMockup>

          <div 
            style={{ 
              position: 'absolute', 
              top: 8, 
              right: 16, 
              zIndex: 5,
              transform: `translateY(${browserSlide}px)`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <Img src={staticFile('logos/mdown.png')} style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </div>

            {showPopup && (
              <div style={{ position: 'absolute', top: 36, right: 0, zIndex: 10 }}>
                <PopupMockup 
                  animate={true} 
                  delay={55} 
                  status={popupStatus}
                  style={{ transformOrigin: 'top right' }}
                />
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${cursorX}px, ${cursorY}px) scale(${cursorClick})`,
            opacity: cursorOpacity,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.2)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: -5, left: -5 }}>
             <path d="M3 3L10 21L12 12L21 10L3 3Z" fill="black" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
      </AbsoluteFill>

      {frame > 100 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
          <div
            style={{
              width: 450,
              transform: `translateX(${leftPanelX - successSlide}px)`,
              opacity: interpolate(frame, [110, 120], [0, 1]),
            }}
          >
            <div style={{ 
              marginBottom: 16, 
              color: COLORS.textMedium, 
              fontFamily: FONTS.code,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              HTML Source
            </div>
            <CodeBlock
              code={htmlCode}
              language="html"
              animate={true}
              startFrame={130}
              typingSpeed={3}
              style={{ height: 600 }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              transform: `scale(${arrowScale})`,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div
            style={{
              width: 450,
              transform: `translateX(${rightPanelX + successSlide}px)`,
              opacity: interpolate(frame, [110, 120], [0, 1]),
            }}
          >
            <div style={{ 
              marginBottom: 16, 
              color: COLORS.textMedium, 
              fontFamily: FONTS.code,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Markdown Output
            </div>
            <div
              style={{
                background: COLORS.white,
                borderRadius: 8,
                padding: 30,
                height: 600,
                border: `1px solid ${COLORS.border}`,
                boxShadow: `0 10px 30px ${COLORS.shadow}`,
                overflow: 'hidden'
              }}
            >
              <MarkdownBlock
                lines={mdLines}
                animate={true}
                startFrame={140}
              />
            </div>
          </div>

          {frame > 250 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 20,
              }}
            >
              {renderCheck(250, "Clean")}
              {renderCheck(260, "Local")}
              {renderCheck(270, "One Click")}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
