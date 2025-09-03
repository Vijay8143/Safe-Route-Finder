import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

// Default theme fallbacks
const defaultTheme = {
  mode: 'dark',
  colors: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    surface: 'rgba(30, 41, 59, 0.9)',
    surfaceLight: 'rgba(51, 65, 85, 0.7)',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#818cf8',
    primaryHover: '#6366f1',
    primaryLight: '#a5b4fc',
    secondary: '#a78bfa',
    accent: '#f472b6',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    hover: 'rgba(129, 140, 248, 0.1)',
    active: 'rgba(129, 140, 248, 0.2)',
    disabled: '#475569',
    glass: 'rgba(30, 41, 59, 0.4)',
    glassHover: 'rgba(51, 65, 85, 0.5)',
    backdrop: 'rgba(15, 23, 42, 0.8)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(129, 140, 248, 0.4)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
};

// Deep merge function to combine themes
const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  
  return result;
};

const ThemeFallbackWrapper = ({ children }) => {
  const { theme } = useTheme();
  
  // Merge provided theme with default fallbacks
  const safeTheme = deepMerge(defaultTheme, theme || {});
  
  return (
    <ThemeProvider theme={safeTheme}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeFallbackWrapper; 