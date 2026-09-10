import { useEffect, useState } from 'react';

const LANDING_THEME_KEY = 'landingTheme';

export const getLandingTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(LANDING_THEME_KEY) || 'dark';
};

export const setLandingTheme = (theme) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LANDING_THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent('landing-theme-change', { detail: theme }));
};

export const useLandingTheme = () => {
  const [theme, setThemeState] = useState(getLandingTheme);

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event?.detail || getLandingTheme();
      setThemeState(nextTheme);
    };

    const handleStorage = (event) => {
      if (event.key === LANDING_THEME_KEY) {
        setThemeState(event.newValue || 'dark');
      }
    };

    window.addEventListener('landing-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('landing-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    setLandingTheme(nextTheme);
  };

  return { theme, isLight: theme === 'light', setTheme };
};
