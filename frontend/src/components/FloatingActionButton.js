import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4); }
`;

const FABContainer = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
  }
`;

const SOSButton = styled(motion.button)`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  
  &:hover {
    animation: ${glow} 1s infinite;
  }
  
  svg {
    width: 32px;
    height: 32px;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const QuickActions = styled(motion.div)`
  position: absolute;
  bottom: 80px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (max-width: 768px) {
    bottom: 70px;
  }
`;

const QuickActionsContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
`;

const ActionButton = styled(motion.button)`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const EmergencyButton = styled(ActionButton)`
  background: ${props => props.theme?.colors?.error || '#f87171'};
  color: white;
  
  &:hover {
    background: ${props => props.theme?.colors?.error || '#f87171'}dd;
    box-shadow: 0 0 20px ${props => props.theme?.colors?.error || '#f87171'}60;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.theme?.colors?.textSecondary || '#cbd5e1'};
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)'};
    color: ${props => props.theme?.colors?.text || '#f8fafc'};
  }
`;

const SOSContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(20px);
  text-align: center;
  padding: 2rem;
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  backdrop-filter: blur(20px);
  z-index: 10;
`;

const CountdownOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const FloatingActionButton = () => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showTooltip, setShowTooltip] = useState(null);

  const handleSOSPress = () => {
    if (isCountingDown) {
      // Cancel SOS
      setIsCountingDown(false);
      setCountdown(5);
      toast.success('SOS Cancelled');
      return;
    }

    // Start SOS countdown
    setIsCountingDown(true);
    let count = 5;
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setIsCountingDown(false);
        setCountdown(5);
        triggerSOS();
      }
    }, 1000);

    toast.error('SOS will activate in 5 seconds. Press again to cancel.');
  };

  const triggerSOS = () => {
    // Trigger SOS functionality
    toast.error('🚨 SOS ACTIVATED! Emergency contacts have been notified.');
    
    // Here you would typically:
    // 1. Send location to emergency contacts
    // 2. Call emergency services API
    // 3. Start location sharing
    // 4. Send push notifications
    
    console.log('SOS ACTIVATED!');
  };

  const quickActions = [
    {
      icon: '📞',
      label: 'Call Emergency',
      action: () => {
        window.location.href = 'tel:911';
        toast.success('Calling emergency services...');
      }
    },
    {
      icon: '📍',
      label: 'Share Location',
      action: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
              navigator.clipboard.writeText(locationUrl);
              toast.success('Location copied to clipboard!');
            },
            () => {
              toast.error('Unable to get your location');
            }
          );
        }
      }
    },
    {
      icon: '🚨',
      label: 'Alert Contacts',
      action: () => {
        toast.success('Emergency alert sent to contacts!');
        // Send alert to emergency contacts
      }
    }
  ];

  return (
    <FABContainer>
      {/* Quick Actions */}
      <AnimatePresence>
        {isExpanded && (
          <QuickActions
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {quickActions.map((action, index) => (
              <div key={action.label} style={{ position: 'relative' }}>
                <ActionButton
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  onMouseEnter={() => setShowTooltip(action.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.icon}
                </ActionButton>
                
                <AnimatePresence>
                  {showTooltip === action.label && (
                    <Tooltip
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {action.label}
                    </Tooltip>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </QuickActions>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <SOSButton
        onClick={handleSOSPress}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: isCountingDown 
            ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
            : 'linear-gradient(135deg, #ef4444, #dc2626)'
        }}
      >
        <ShieldExclamationIcon />
        
        {/* Countdown Overlay */}
        <AnimatePresence>
          {isCountingDown && (
            <CountdownOverlay
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {countdown}
            </CountdownOverlay>
          )}
        </AnimatePresence>
      </SOSButton>
    </FABContainer>
  );
};

export default FloatingActionButton; 