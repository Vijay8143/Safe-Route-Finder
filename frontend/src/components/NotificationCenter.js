import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    max-width: none;
  }
`;

const NotificationCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  box-shadow: ${props => props.theme.shadows.xl};
  pointer-events: auto;
  position: relative;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 12px;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.type) {
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      default: return props.theme.colors.info;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const NotificationMessage = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    switch (props.type) {
      case 'error': return props.theme.colors.error;
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      default: return props.theme.colors.info;
    }
  }};
  border-radius: 0 0 ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg};
`;

const NotificationCenter = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Welcome to SafeRoute!',
        message: 'Your personal safety companion is ready to help.',
        duration: 5000,
        icon: '🛡️'
      },
      {
        id: 2,
        type: 'success',
        title: 'Location Services Enabled',
        message: 'We can now provide accurate safety recommendations.',
        duration: 4000,
        icon: '📍'
      }
    ];

    // Add notifications with delay
    mockNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, index * 1000);
    });
  }, []);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      ...notification,
      id,
      createdAt: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type, customIcon) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <NotificationContainer>
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            whileHover={{ scale: 1.02 }}
          >
            <NotificationHeader>
              <NotificationIcon type={notification.type}>
                {getIcon(notification.type, notification.icon)}
              </NotificationIcon>
              
              <NotificationContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
              </NotificationContent>
            </NotificationHeader>

            <CloseButton onClick={() => removeNotification(notification.id)}>
              <XMarkIcon />
            </CloseButton>

            {notification.duration && (
              <ProgressBar
                type={notification.type}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ 
                  duration: notification.duration / 1000,
                  ease: "linear"
                }}
              />
            )}
          </NotificationCard>
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default NotificationCenter; 