import { AbsoluteFill, Sequence } from 'remotion';
import { SCENE } from './lib/timing';
import { IntroScene } from './scenes/IntroScene';
import { ProblemScene } from './scenes/ProblemScene';
import { ConversionScene } from './scenes/ConversionScene';
import { OrbitScene } from './scenes/OrbitScene';
import { CtaScene } from './scenes/CtaScene';

export const MdownPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#ffffff' }}>
      <Sequence from={SCENE.INTRO.start} durationInFrames={SCENE.INTRO.duration}>
        <IntroScene />
      </Sequence>
      <Sequence from={SCENE.PROBLEM.start} durationInFrames={SCENE.PROBLEM.duration}>
        <ProblemScene />
      </Sequence>
      <Sequence from={SCENE.CONVERSION.start} durationInFrames={SCENE.CONVERSION.duration}>
        <ConversionScene />
      </Sequence>
      <Sequence from={SCENE.PKM.start} durationInFrames={SCENE.PKM.duration}>
        <OrbitScene />
      </Sequence>
      <Sequence from={SCENE.CTA.start} durationInFrames={SCENE.CTA.duration}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
