import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

export const { fontFamily: interFont } = loadInter();
export const { fontFamily: monoFont } = loadJetBrainsMono();

export const FONTS = {
  heading: interFont,
  body: interFont,
  code: monoFont,
} as const;
