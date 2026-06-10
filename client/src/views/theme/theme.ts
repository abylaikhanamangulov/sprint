export const theme = {
  colors: {
    bgPrimary: '#0f0f13',
    bgSecondary: '#15151a',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgCardHover: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#ffffff',
    textSecondary: '#8a8d9b',
    accent: '#cfff04',
    accentHover: '#b8e600',
    gold: '#ffb800',
    silver: '#a6adb5',
    green: '#cfff04',
    red: '#ff3b30',
    orange: '#ff9500',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  classColors: {
    D: '#4a5568',
    C: '#3498db',
    B: '#9b59b6',
    A: '#e74c3c',
    S: '#f1c40f',
    X: '#00e5d0',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    round: '9999px',
  },
  shadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
} as const;

export type AppTheme = typeof theme;
