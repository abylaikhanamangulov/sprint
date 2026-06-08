export const theme = {
  colors: {
    bgPrimary: '#111111',
    bgSecondary: '#1a1a1a',
    bgCard: '#242424',
    bgCardHover: '#2a2a2a',
    textPrimary: '#ffffff',
    textSecondary: '#8e8e93',
    accent: '#b8ff22',
    accentHover: '#cfff04',
    gold: '#ffd700',
    silver: '#c0c7d4',
    green: '#b8ff22',
    red: '#ff4757',
    orange: '#ffa502',
    border: '#333333',
  },
  classColors: {
    D: '#4a5568',
    C: '#2d8cf0',
    B: '#9b59b6',
    A: '#e74c3c',
    S: '#ffd700',
    X: '#00e5d0',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '12px',
  },
  shadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
} as const;

export type AppTheme = typeof theme;
