import { useCurrentFrame } from 'remotion';
import { FONTS } from '../lib/fonts';

interface TypeWriterProps {
  text: string;
  startFrame?: number;
  speed?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  startFrame = 0,
  speed = 2,
  style,
  cursorColor = '#4a9eff',
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(Math.floor(elapsed / speed), text.length);
  const visibleText = text.slice(0, charsToShow);
  const isComplete = charsToShow >= text.length;
  const showCursor = !isComplete && elapsed > 0;

  return (
    <span style={{ fontFamily: FONTS.code, whiteSpace: 'pre', ...style }}>
      {visibleText}
      {showCursor && (
        <span
          style={{
            borderRight: `2px solid ${cursorColor}`,
            animation: 'blink 0.8s infinite',
            marginLeft: 1,
          }}
        />
      )}
    </span>
  );
};
