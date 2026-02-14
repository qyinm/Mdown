import { Composition } from 'remotion';
import { MdownPromo } from './MdownPromo';
import { FPS, TOTAL_FRAMES } from './lib/timing';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MdownPromo"
      component={MdownPromo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
