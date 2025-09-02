import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import { GeolocationProvider } from './context/GeolocationContext';
import ThemeFallbackWrapper from './components/ThemeFallbackWrapper';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingActionButton from './components/FloatingActionButton';
import ParticleBackground from './components/ParticleBackground';
import NotificationCenter from './components/NotificationCenter';


// Lazy Load Components for Performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RouteMap = lazy(() => import('./pages/RouteMap'));
const SafetyAlerts = lazy(() => import('./pages/SafetyAlerts'));
const SOSPanel = lazy(() => import('./pages/SOSPanel'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Create React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Styled Components with Advanced Glassmorphism and fallbacks
const AppContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'};
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  overflow-x: hidden;
  position: relative;
`;

const ContentContainer = styled(motion.div)`
  position: relative;
  z-index: 10;
  min-height: 100vh;
  backdrop-filter: blur(20px);
  background: ${props => props.theme?.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
`;

const RouteContainer = styled(motion.div)`
  padding-top: ${props => props.hasNavbar ? '80px' : '0'};
  min-height: calc(100vh - ${props => props.hasNavbar ? '80px' : '0'});
`;

// Global Styles with Modern CSS and fallbacks
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.primary || '#818cf8'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.colors?.primaryHover || '#6366f1'};
  }

  .glassmorphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

// Animation Variants
const pageTransition = {
  initial: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Main App Component
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Check authentication status
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
        
        // Simulate loading time for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <GlobalStyle />
      <AppContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Particle Background for Visual Appeal */}
        <ParticleBackground />
        
        <ContentContainer>
          {/* Navigation */}
          {isAuthenticated && <Navbar />}
          
          <RouteContainer hasNavbar={isAuthenticated}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Login />
                        </Suspense>
                      </motion.div>
                    )
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Register />
                        </Suspense>
                      </motion.div>
                    )
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Dashboard />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/map" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <RouteMap />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <SafetyAlerts />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sos" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <SOSPanel />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Analytics />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Profile />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <motion.div {...pageTransition}>
                        <Suspense fallback={<LoadingScreen />}>
                          <Settings />
                        </Suspense>
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />



                {/* Default Route */}
                <Route 
                  path="/" 
                  element={
                    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                  } 
                />
                
                {/* 404 Fallback */}
                <Route 
                  path="*" 
                  element={
                    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                  } 
                />
              </Routes>
            </AnimatePresence>
          </RouteContainer>

          {/* Floating Action Button for Quick SOS */}
          {isAuthenticated && <FloatingActionButton />}
          
          {/* Notification Center */}
          <NotificationCenter />
        </ContentContainer>

        {/* Toast Notifications with Custom Styling */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)',
              color: theme?.colors?.text || '#f8fafc',
              border: `1px solid ${theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(20px)',
            },
            success: {
              iconTheme: {
                primary: theme?.colors?.success || '#34d399',
                secondary: theme?.colors?.background || '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: theme?.colors?.error || '#f87171',
                secondary: theme?.colors?.background || '#0f172a',
              },
            },
          }}
        />
      </AppContainer>
    </>
  );
}

// Main App Wrapper with All Providers
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <GeolocationProvider>
            <Router>
              <ThemeFallbackWrapper>
                <AppContent />
              </ThemeFallbackWrapper>
            </Router>
          </GeolocationProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
} 