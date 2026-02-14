export const FPS = 30;

export const SCENE = {
  INTRO: { start: 0, duration: 120 },       // 0–4s
  PROBLEM: { start: 120, duration: 120 },    // 4–8s
  CONVERSION: { start: 240, duration: 300 }, // 8–18s
  PKM: { start: 540, duration: 210 },        // 18–25s
  CTA: { start: 750, duration: 120 },        // 25–29s
} as const;

export const TOTAL_FRAMES = 870;
export function secondsToFrames(seconds: number): number {
  return Math.round(seconds * FPS);
}

export function framesToSeconds(frames: number): number {
  return frames / FPS;
}
