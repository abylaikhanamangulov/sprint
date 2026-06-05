export const theme = {
  colors: {
    bgPrimary: '#0a0e1a',
    bgSecondary: '#141829',
    bgCard: '#1c2137',
    bgCardHover: '#242a45',
    textPrimary: '#e8eaf0',
    textSecondary: '#8890a8',
    accent: '#4e7cff',
    accentHover: '#3d6bef',
    gold: '#ffd700',
    silver: '#c0c7d4',
    green: '#2ed573',
    red: '#ff4757',
    orange: '#ffa502',
    border: '#2a3050',
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
