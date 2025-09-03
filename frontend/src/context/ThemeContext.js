import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme configurations
const lightTheme = {
  mode: 'light',
  colors: {
    // Base colors - Modern bright theme with subtle gradients
    background: `
      radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.03) 0%, transparent 50%),
      linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #e2e8f0 75%, #f8f9ff 100%)
    `,
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceLight: 'rgba(248, 250, 252, 0.9)',
    
    // Text colors with excellent contrast
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    
    // Brand colors - Vibrant but accessible
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#a855f7',
    secondary: '#4f46e5',
    accent: '#ec4899',
    
    // Status colors optimized for light backgrounds
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
    
    // UI colors with better contrast
    border: 'rgba(99, 102, 241, 0.2)',
    borderHover: 'rgba(99, 102, 241, 0.4)',
    
    // Interactive colors
    hover: 'rgba(139, 92, 246, 0.08)',
    active: 'rgba(139, 92, 246, 0.15)',
    disabled: '#94a3b8',
    
    // Light glassmorphism with subtle tints
    glass: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.8) 0%, 
        rgba(248, 250, 252, 0.6) 50%, 
        rgba(241, 245, 249, 0.8) 100%
      )
    `,
    glassHover: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.7) 50%, 
        rgba(241, 245, 249, 0.9) 100%
      )
    `,
    backdrop: 'rgba(255, 255, 255, 0.9)',
    
    // Light theme shine effects
    shine: `
      linear-gradient(45deg, 
        transparent 30%, 
        rgba(139, 92, 246, 0.05) 50%, 
        transparent 70%
      )
    `,
    reflection: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.8) 0%, 
        transparent 50%
      )
    `,
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: `
      0 0 20px rgba(139, 92, 246, 0.15),
      0 0 40px rgba(99, 102, 241, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.1)
    `,
    shine: `
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 1px 3px rgba(0, 0, 0, 0.1)
    `,
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    // Base colors - Deep violet-black with shiny accents
    background: `
      radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f1419 75%, #000000 100%)
    `,
    surface: 'rgba(26, 26, 46, 0.95)',
    surfaceLight: 'rgba(83, 52, 131, 0.8)',
    
    // Text colors with violet tints
    text: '#f8f9ff',
    textSecondary: '#e2e8f0',
    textMuted: '#cbd5e1',
    
    // Brand colors - Rich violet spectrum
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#6366f1',
    accent: '#ec4899',
    
    // Status colors with violet undertones
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // UI colors with violet glow
    border: 'rgba(139, 92, 246, 0.3)',
    borderHover: 'rgba(139, 92, 246, 0.6)',
    
    // Interactive colors
    hover: 'rgba(139, 92, 246, 0.15)',
    active: 'rgba(139, 92, 246, 0.25)',
    disabled: '#4b5563',
    
    // Advanced glassmorphism
    glass: `
      linear-gradient(135deg, 
        rgba(139, 92, 246, 0.1) 0%, 
        rgba(99, 102, 241, 0.05) 50%, 
        rgba(236, 72, 153, 0.1) 100%
      )
    `,
    glassHover: `
      linear-gradient(135deg, 
        rgba(139, 92, 246, 0.2) 0%, 
        rgba(99, 102, 241, 0.1) 50%, 
        rgba(236, 72, 153, 0.15) 100%
      )
    `,
    backdrop: 'rgba(10, 10, 15, 0.9)',
    
    // Shiny gradient overlays
    shine: `
      linear-gradient(45deg, 
        transparent 30%, 
        rgba(139, 92, 246, 0.1) 50%, 
        transparent 70%
      )
    `,
    reflection: `
      linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%
      )
    `,
  },
  shadows: {
    sm: '0 2px 4px 0 rgba(139, 92, 246, 0.2)',
    md: '0 8px 16px -2px rgba(139, 92, 246, 0.3)',
    lg: '0 16px 32px -4px rgba(139, 92, 246, 0.4)',
    xl: '0 24px 48px -8px rgba(139, 92, 246, 0.5)',
    glow: `
      0 0 20px rgba(139, 92, 246, 0.4),
      0 0 40px rgba(99, 102, 241, 0.3),
      0 0 60px rgba(236, 72, 153, 0.2)
    `,
    shine: `
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 1px 3px rgba(139, 92, 246, 0.3)
    `,
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
    xl: '24px',
    full: '9999px',
  },
};

// Create context with default theme
const ThemeContext = createContext({
  theme: darkTheme,
  isDarkMode: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to dark mode
    try {
      const savedTheme = localStorage.getItem('safeRoute_theme');
      return savedTheme ? JSON.parse(savedTheme) : true;
    } catch (error) {
      console.error('Error reading saved theme:', error);
      return true; // Default to dark mode
    }
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      try {
        localStorage.setItem('safeRoute_theme', JSON.stringify(newMode));
      } catch (error) {
        console.error('Error saving theme:', error);
      }
      return newMode;
    });
  };

  const setTheme = (mode) => {
    const isDark = mode === 'dark';
    setIsDarkMode(isDark);
    try {
      localStorage.setItem('safeRoute_theme', JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // System theme preference detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      try {
        const savedTheme = localStorage.getItem('safeRoute_theme');
        // Only update if user hasn't manually set a preference
        if (!savedTheme) {
          setIsDarkMode(e.matches);
        }
      } catch (error) {
        console.error('Error handling system theme change:', error);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Set initial theme based on system preference if no saved preference
    try {
      const savedTheme = localStorage.getItem('safeRoute_theme');
      if (!savedTheme) {
        setIsDarkMode(mediaQuery.matches);
      }
    } catch (error) {
      console.error('Error setting initial theme:', error);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Update CSS custom properties for global access
  useEffect(() => {
    try {
      const root = document.documentElement;
      
      // Set CSS custom properties
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });

      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });

      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value);
      });

      // Update meta theme color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme.colors.primary);
      }
    } catch (error) {
      console.error('Error updating CSS custom properties:', error);
    }
  }, [theme]);

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if context is not available
    console.warn('useTheme must be used within a ThemeProvider, using default theme');
    return {
      theme: darkTheme,
      isDarkMode: true,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

export default ThemeContext; 