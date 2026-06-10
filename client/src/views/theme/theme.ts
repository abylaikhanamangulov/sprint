export const theme = {
  colors: {
    bgPrimary: '#000000',
    bgSecondary: '#09090b',
    bgCard: '#111111',
    bgCardHover: '#18181b',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#cfff04',
    accentHover: '#bceb00',
    gold: '#fbbf24',
    silver: '#a1a1aa',
    green: '#cfff04',
    red: '#ef4444',
    orange: '#f59e0b',
    border: '#27272a',
  },
  classColors: {
    D: '#52525b',
    C: '#3b82f6',
    B: '#8b5cf6',
    A: '#ef4444',
    S: '#fbbf24',
    X: '#06b6d4',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    round: '9999px',
  },
  shadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
} as const;

export type AppTheme = typeof theme;
