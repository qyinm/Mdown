import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface SpringScaleProps {
  children: React.ReactNode;
  delay?: number;
  mass?: number;
  damping?: number;
  style?: React.CSSProperties;
}

export const SpringScale: React.FC<SpringScaleProps> = ({
  children,
  delay = 0,
  mass = 0.6,
  damping = 12,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { mass, damping },
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
