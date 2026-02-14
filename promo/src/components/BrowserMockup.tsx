import React from 'react';
import { COLORS } from '../lib/colors';
import { FONTS } from '../lib/fonts';

interface BrowserMockupProps {
  children: React.ReactNode;
  url?: string;
  showToolbar?: boolean;
  style?: React.CSSProperties;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  children,
  url = 'https://example.com/article',
  showToolbar = true,
  style,
}) => {
  return (
    <div
      style={{
        width: 960,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        boxShadow: `0 20px 50px -12px ${COLORS.shadow}, 0 0 1px ${COLORS.borderDark}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: 40,
          background: '#f1f5f9',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
        </div>

        {showToolbar && (
          <div
            style={{
              flex: 1,
              height: 28,
              background: COLORS.white,
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              fontSize: 12,
              fontFamily: FONTS.body,
              color: COLORS.textMedium,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ marginRight: 4, opacity: 0.5 }}>🔒</span>
            {url}
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};
