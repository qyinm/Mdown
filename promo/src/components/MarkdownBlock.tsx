import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

interface MarkdownLine {
  type: 'h1' | 'h2' | 'p' | 'link' | 'image';
  text: string;
}

interface MarkdownBlockProps {
  lines: Array<MarkdownLine>;
  animate?: boolean;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({
  lines,
  animate = true,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        fontFamily: FONTS.body,
        color: COLORS.textDark,
        lineHeight: 1.6,
        ...style,
      }}
    >
      {lines.map((line, index) => {
        const delay = startFrame + index * 10;
        const opacity = animate
          ? interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          : 1;

        const translateY = animate
          ? interpolate(frame, [delay, delay + 15], [10, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          : 0;

        const commonStyle: React.CSSProperties = {
          opacity,
          transform: `translateY(${translateY}px)`,
          marginBottom: 16,
        };

        switch (line.type) {
          case 'h1':
            return (
              <h1
                key={index}
                style={{
                  ...commonStyle,
                  fontFamily: FONTS.heading,
                  fontSize: 32,
                  fontWeight: 800,
                  color: COLORS.textDark,
                  marginBottom: 24,
                  letterSpacing: '-0.02em',
                }}
              >
                {line.text}
              </h1>
            );
          case 'h2':
            return (
              <h2
                key={index}
                style={{
                  ...commonStyle,
                  fontFamily: FONTS.heading,
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.textDark,
                  marginTop: 32,
                  marginBottom: 16,
                  letterSpacing: '-0.01em',
                }}
              >
                {line.text}
              </h2>
            );
          case 'link':
            return (
              <p
                key={index}
                style={{
                  ...commonStyle,
                  color: COLORS.primary,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {line.text}
              </p>
            );
          case 'image':
            return (
              <div
                key={index}
                style={{
                  ...commonStyle,
                  width: '100%',
                  height: 200,
                  backgroundColor: COLORS.bgLight,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textLight,
                  fontSize: 14,
                }}
              >
                [Image: {line.text}]
              </div>
            );
          case 'p':
          default:
            return (
              <p
                key={index}
                style={{
                  ...commonStyle,
                  fontSize: 16,
                  color: COLORS.textMedium,
                }}
              >
                {line.text}
              </p>
            );
        }
      })}
    </div>
  );
};
