// Default theme fallbacks for styled-components
export const defaultTheme = {
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

// Utility function to safely access theme properties with fallbacks
export const getThemeValue = (theme, path, fallback) => {
  const pathArray = path.split('.');
  let current = theme;
  
  for (const key of pathArray) {
    if (current && current[key] !== undefined) {
      current = current[key];
    } else {
      return fallback || getDefaultValue(path);
    }
  }
  
  return current || fallback || getDefaultValue(path);
};

// Helper function to get default values based on common theme paths
export const getDefaultValue = (path) => {
  const pathMap = {
    'colors.background': defaultTheme.colors.background,
    'colors.surface': defaultTheme.colors.surface,
    'colors.text': defaultTheme.colors.text,
    'colors.textSecondary': defaultTheme.colors.textSecondary,
    'colors.textMuted': defaultTheme.colors.textMuted,
    'colors.primary': defaultTheme.colors.primary,
    'colors.primaryHover': defaultTheme.colors.primaryHover,
    'colors.secondary': defaultTheme.colors.secondary,
    'colors.accent': defaultTheme.colors.accent,
    'colors.success': defaultTheme.colors.success,
    'colors.warning': defaultTheme.colors.warning,
    'colors.error': defaultTheme.colors.error,
    'colors.info': defaultTheme.colors.info,
    'colors.border': defaultTheme.colors.border,
    'colors.hover': defaultTheme.colors.hover,
    'colors.glass': defaultTheme.colors.glass,
    'shadows.sm': defaultTheme.shadows.sm,
    'shadows.md': defaultTheme.shadows.md,
    'shadows.lg': defaultTheme.shadows.lg,
    'shadows.xl': defaultTheme.shadows.xl,
    'borderRadius.sm': defaultTheme.borderRadius.sm,
    'borderRadius.md': defaultTheme.borderRadius.md,
    'borderRadius.lg': defaultTheme.borderRadius.lg,
    'borderRadius.xl': defaultTheme.borderRadius.xl,
  };
  
  return pathMap[path] || '#818cf8'; // Default to primary color
};

// Styled-components helper function for safe theme access
export const safeTheme = (path, fallback) => (props) => {
  return getThemeValue(props.theme, path, fallback);
};

export default {
  defaultTheme,
  getThemeValue,
  getDefaultValue,
  safeTheme,
}; 