import { useState, useCallback } from 'react';

export interface ThemeColors {
  darkSquare: string;
  lightSquare: string;
  background: string;
  accent: string;
  vibrant: string;
  muted: string;
}

export interface ThemeData {
  imageUrl: string;
  colors: ThemeColors;
  query: string;
  musicUrl?: string;
}

export interface UseThemeReturn {
  currentTheme: ThemeData | null;
  isLoading: boolean;
  error: string | null;
  applyTheme: (query: string) => Promise<ThemeData | null>;
  applyRemoteTheme: (theme: ThemeData) => void;
  resetTheme: () => void;
}

const DEFAULT_THEME: ThemeData = {
  imageUrl: '',
  colors: {
    darkSquare: '#739552',
    lightSquare: '#ebecd0',
    background: 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))',
    accent: '#3b82f6',
    vibrant: '#60a5fa',
    muted: '#94a3b8',
  },
  query: 'default',
};

export const useTheme = (): UseThemeReturn => {
  const [currentTheme, setCurrentTheme] = useState<ThemeData | null>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Apply a new theme by fetching from API
   */
  const applyTheme = useCallback(async (query: string): Promise<ThemeData | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch theme');
      }

      const themeData: ThemeData = await response.json();
      setCurrentTheme(themeData);
      return themeData;
    } catch (err) {
      console.error('Theme error:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply theme');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply a theme payload from the opponent without re-fetching Unsplash
   */
  const applyRemoteTheme = useCallback((theme: ThemeData) => {
    if (!theme) return;

    if (!theme.imageUrl || theme.query === 'default') {
      setCurrentTheme(DEFAULT_THEME);
      return;
    }

    setCurrentTheme(theme);
    setError(null);
  }, []);

  /**
   * Reset to default theme
   */
  const resetTheme = useCallback(() => {
    setCurrentTheme(DEFAULT_THEME);
    setError(null);
  }, []);

  return {
    currentTheme,
    isLoading,
    error,
    applyTheme,
    applyRemoteTheme,
    resetTheme,
  };
};
