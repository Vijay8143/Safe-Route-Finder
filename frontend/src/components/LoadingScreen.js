import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

// Animated background
const floatingParticles = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(15px) rotate(240deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled components
const LoadingContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(20px);
  background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'};
`;

const ParticleCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
`;

const LoadingContent = styled(motion.div)`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 400px;
  padding: 2rem;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 2rem;
  position: relative;
`;

const Logo = styled(motion.div)`
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
              inset 0 0 60px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.theme?.colors?.background || 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'};
    animation: rotate 3s linear infinite;
    opacity: 0.3;
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LogoIcon = styled(motion.div)`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#818cf8'}, ${props => props.theme?.colors?.secondary || '#a78bfa'});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '🛡️';
    font-size: 2rem;
  }
`;

const AppTitle = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#818cf8'}, ${props => props.theme?.colors?.accent || '#f472b6'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const AppSubtitle = styled(motion.p)`
  font-size: 1rem;
  color: ${props => props.theme?.colors?.textSecondary || '#cbd5e1'};
  margin-bottom: 3rem;
  font-weight: 500;
`;

const ProgressContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto 2rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border-radius: 50px;
  padding: 4px;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  overflow: hidden;
`;

const ProgressBar = styled(motion.div)`
  height: 8px;
  background: linear-gradient(90deg, ${props => props.theme?.colors?.primary || '#818cf8'}, ${props => props.theme?.colors?.accent || '#f472b6'});
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const LoadingText = styled(motion.p)`
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.textMuted || '#94a3b8'};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const LoadingDots = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme?.colors?.primary || '#818cf8'};
`;

// Loading messages
const loadingMessages = [
  'Initializing SafeRoute Navigator...',
  'Loading security protocols...',
  'Connecting to safety network...',
  'Preparing your dashboard...',
  'Enabling location services...',
  'Loading safety data...',
  'Almost ready...',
];

const LoadingScreen = () => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prev + increment, 100);
        
        // Update message based on progress
        const messageIndex = Math.floor((newProgress / 100) * (loadingMessages.length - 1));
        setCurrentMessage(messageIndex);
        
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 2,
    duration: Math.random() * 10 + 5,
    color: i % 3 === 0 ? (theme?.colors?.primary || '#818cf8') : 
           i % 3 === 1 ? (theme?.colors?.secondary || '#a78bfa') : 
           (theme?.colors?.accent || '#f472b6'),
    blur: Math.random() * 2,
  }));

  return (
    <LoadingContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Particle Background */}
      <ParticleCanvas
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme?.colors?.primary || '#818cf8'}10 0%, transparent 50%)`
        }}
      />

      {/* Main Content */}
      <LoadingContent
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Logo */}
        <LogoContainer>
          <Logo
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <LogoIcon />
          </Logo>
        </LogoContainer>

        {/* Title */}
        <AppTitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          SafeRoute Navigator
        </AppTitle>

        {/* Subtitle */}
        <AppSubtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your Personal Safety Companion
        </AppSubtitle>

        {/* Progress Bar */}
        <ProgressContainer
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ProgressBar
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </ProgressContainer>

        {/* Status Text */}
        <AnimatePresence mode="wait">
          <LoadingText
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loadingMessages[currentMessage]}
          </LoadingText>
        </AnimatePresence>

        {/* Loading Dots */}
        <LoadingDots>
          {[0, 1, 2].map((i) => (
            <Dot
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </LoadingDots>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default LoadingScreen; 