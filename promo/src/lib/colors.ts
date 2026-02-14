export const COLORS = {
  // Primary brand
  primary: '#4a9eff',
  primaryDark: '#1a5fcc',
  primaryLight: '#7dbfff',
  primaryGlow: 'rgba(74, 158, 255, 0.3)',

  // Backgrounds
  white: '#ffffff',
  bgLight: '#f8fafc',
  bgDark: '#0f172a',
  bgDarkAlt: '#1e293b',

  // Text
  textDark: '#1e293b',
  textMedium: '#475569',
  textLight: '#94a3b8',
  textOnDark: '#e2e8f0',

  // Accents
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  obsidian: '#7c3aed',
  logseq: '#22c55e',
  notion: '#1e1e1e',
  gemini: '#4285F4',
  openai: '#10A37F',
  claude: '#D97757',

  // UI
  border: '#e2e8f0',
  borderDark: '#334155',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export const GRADIENTS = {
  primaryBg: `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
  heroBg: `radial-gradient(ellipse at center, rgba(74, 158, 255, 0.06) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`,
  ctaBg: `linear-gradient(180deg, #ffffff 0%, #f0f4f8 50%, #ffffff 100%)`,
  blueShimmer: `linear-gradient(120deg, transparent 30%, rgba(74, 158, 255, 0.4) 50%, transparent 70%)`,
} as const;
