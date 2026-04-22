import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dovela-theme',
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return localStorage.getItem(storageKey) || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      const resolved =
        theme === 'system'
          ? mediaQuery.matches
            ? 'dark'
            : 'light'
          : theme;

      root.classList.toggle('dark', resolved === 'dark');
      root.setAttribute('data-bs-theme', resolved);
      setResolvedTheme(resolved);
    }

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  function setTheme(newTheme) {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
