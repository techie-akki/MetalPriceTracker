import React from 'react';

type ThemeMode = 'dark' | 'light';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    accent: string;
    background: string;
    cardBorder: string;
    mutedText: string;
    panel: string;
    primaryText: string;
    secondaryText: string;
  };
}

interface ThemeContextValue {
  theme: AppTheme;
  toggleTheme: () => void;
}

const themes: Record<ThemeMode, AppTheme> = {
  dark: {
    mode: 'dark',
    colors: {
      accent: '#8BA3C7',
      background: '#090B12',
      cardBorder: 'rgba(255,255,255,0.10)',
      mutedText: 'rgba(255,255,255,0.56)',
      panel: 'rgba(255,255,255,0.06)',
      primaryText: '#FFFFFF',
      secondaryText: '#B8C0D4',
    },
  },
  light: {
    mode: 'light',
    colors: {
      accent: '#4C6FA5',
      background: '#F4F7FB',
      cardBorder: 'rgba(15,23,42,0.10)',
      mutedText: 'rgba(15,23,42,0.56)',
      panel: 'rgba(255,255,255,0.82)',
      primaryText: '#0F172A',
      secondaryText: '#475569',
    },
  },
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [mode, setMode] = React.useState<ThemeMode>('dark');

  const toggleTheme = React.useCallback(() => {
    setMode(current => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = React.useMemo(
    () => ({
      theme: themes[mode],
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
