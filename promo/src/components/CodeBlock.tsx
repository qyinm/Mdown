import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

interface CodeBlockProps {
  code: string;
  language?: 'html' | 'markdown';
  animate?: boolean;
  startFrame?: number;
  typingSpeed?: number;
  style?: React.CSSProperties;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'html',
  animate = true,
  startFrame = 0,
  typingSpeed = 5,
  style,
}) => {
  const frame = useCurrentFrame();

  const lines = useMemo(() => code.split('\n'), [code]);

  const highlightLine = (line: string, lang: 'html' | 'markdown') => {
    if (lang === 'html') {
      const parts = line.split(/(<[^>]+>)/g);
      return parts.map((part, i) => {
        if (part.startsWith('<')) {
          if (part.startsWith('</')) {
            return (
              <span key={i} style={{ color: COLORS.primary }}>
                {part}
              </span>
            );
          }
          return (
            <span key={i} style={{ color: COLORS.primary }}>
              {part.replace(/(\s+\w+=)/g, (match) => {
                return `<span style="color:${COLORS.warning}">${match}</span>`;
              }).replace(/("[^"]*")/g, (match) => {
                return `<span style="color:${COLORS.success}">${match}</span>`;
              })}
            </span>
          );
        }
        return <span key={i} style={{ color: COLORS.textOnDark }}>{part}</span>;
      });
    } else {
      if (line.startsWith('#')) {
        return <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>{line}</span>;
      }
      const parts = line.split(/(\[[^\]]+\]\([^)]+\))/g);
      return parts.map((part, i) => {
        if (part.match(/(\[[^\]]+\]\([^)]+\))/)) {
           return <span key={i} style={{ color: COLORS.primaryLight }}>{part}</span>;
        }
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
           if (bp.startsWith('**')) {
             return <span key={`${i}-${j}`} style={{ color: 'white', fontWeight: 'bold' }}>{bp}</span>;
           }
           return <span key={`${i}-${j}`}>{bp}</span>;
        });
      });
    }
  };

  const renderLine = (line: string, index: number) => {
    const lineStart = startFrame + index * typingSpeed;
    const opacity = animate 
      ? interpolate(frame, [lineStart, lineStart + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 1;

    if (opacity === 0) return null;

    let content: React.ReactNode = line;

    if (language === 'html') {
        const htmlContent = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        content = highlightLine(line, 'html');
    } else {
        content = highlightLine(line, 'markdown');
    }

    return (
      <div 
        key={index} 
        style={{ 
          opacity, 
          height: 24,
          whiteSpace: 'pre',
          transform: `translateY(${interpolate(frame, [lineStart, lineStart + 10], [5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`
        }}
      >
        <span style={{ 
            display: 'inline-block', 
            width: 30, 
            color: COLORS.textMedium, 
            userSelect: 'none',
            fontSize: 12,
            textAlign: 'right',
            marginRight: 16,
            opacity: 0.5
        }}>
            {index + 1}
        </span>
        {content}
      </div>
    );
  };

  return (
    <div
      style={{
        background: COLORS.bgDark,
        borderRadius: 8,
        padding: '20px 0',
        fontFamily: FONTS.code,
        fontSize: 14,
        color: COLORS.textOnDark,
        overflow: 'hidden',
        boxShadow: `0 10px 30px ${COLORS.shadow}`,
        border: `1px solid ${COLORS.borderDark}`,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {lines.map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
};
