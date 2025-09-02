import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  MapIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PhoneIcon,
  ChartBarIcon,
  BellIcon,
  MapPinIcon,
  UserIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGeolocation } from '../context/GeolocationContext';
import { toast } from 'react-hot-toast';

// Styled Components with Violet-Black Theme
const DashboardContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme?.shadows?.xl || '0 24px 48px -8px rgba(139, 92, 246, 0.5)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  }
`;

const WelcomeContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const WelcomeText = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  font-size: 1.2rem;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const QuickActionButton = styled(motion.button)`
  padding: 1rem 1.5rem;
  background: ${props => {
    if (props.variant === 'primary') return `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})`;
    if (props.variant === 'danger') return `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}, #dc2626)`;
    return props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)';
  }};
  color: ${props => props.variant ? 'white' : (props.theme?.colors?.text || '#f8f9ff')};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme?.shadows?.md || '0 8px 16px -2px rgba(139, 92, 246, 0.3)'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)'};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      if (props.status === 'active') return `linear-gradient(90deg, ${props.theme?.colors?.success || '#10b981'}, ${props.theme?.colors?.success || '#10b981'}80)`;
      if (props.status === 'warning') return `linear-gradient(90deg, ${props.theme?.colors?.warning || '#f59e0b'}, ${props.theme?.colors?.warning || '#f59e0b'}80)`;
      if (props.status === 'danger') return `linear-gradient(90deg, ${props.theme?.colors?.error || '#ef4444'}, ${props.theme?.colors?.error || '#ef4444'}80)`;
      return `linear-gradient(90deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.accent || '#ec4899'})`;
    }};
  }
  
  &:hover {
    transform: translateY(-4px);
    background: ${props => props.theme?.colors?.glassHover || 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.15) 100%)'};
    border-color: ${props => props.theme?.colors?.borderHover || 'rgba(139, 92, 246, 0.6)'};
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)'};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => {
    if (props.status === 'active') return `linear-gradient(135deg, ${props.theme?.colors?.success || '#10b981'}, ${props.theme?.colors?.success || '#10b981'}80)`;
    if (props.status === 'warning') return `linear-gradient(135deg, ${props.theme?.colors?.warning || '#f59e0b'}, ${props.theme?.colors?.warning || '#f59e0b'}80)`;
    if (props.status === 'danger') return `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}, ${props.theme?.colors?.error || '#ef4444'}80)`;
    return `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.accent || '#ec4899'})`;
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
  
  svg {
    width: 30px;
    height: 30px;
  }
`;

const StatValue = styled.h3`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  font-size: 1.1rem;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    transform: translateX(4px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LocationCard = styled(motion.div)`
  background: ${props => props.isActive ? 
    `linear-gradient(135deg, ${props.theme?.colors?.success || '#10b981'}20, ${props.theme?.colors?.success || '#10b981'}10)` :
    `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}20, ${props.theme?.colors?.error || '#ef4444'}10)`
  };
  border: 1px solid ${props => props.isActive ? 
    (props.theme?.colors?.success || '#10b981') + '40' : 
    (props.theme?.colors?.error || '#ef4444') + '40'
  };
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1.5rem;
  text-align: center;
  
  h3 {
    color: ${props => props.isActive ? 
      (props.theme?.colors?.success || '#10b981') : 
      (props.theme?.colors?.error || '#ef4444')
    };
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
    margin: 0;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { location, isTracking, startTracking, stopTracking } = useGeolocation();
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [safetyStatus, setSafetyStatus] = useState('active');
  const [recentAlerts, setRecentAlerts] = useState([]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Mock data for demonstration
  const stats = [
    {
      icon: ShieldCheckIcon,
      value: "98%",
      label: "Safety Score",
      status: "active"
    },
    {
      icon: MapPinIcon,
      value: "15",
      label: "Safe Routes",
      status: "active"
    },
    {
      icon: ExclamationTriangleIcon,
      value: "3",
      label: "Active Alerts",
      status: "warning"
    },
    {
      icon: PhoneIcon,
      value: "24/7",
      label: "Emergency Ready",
      status: "active"
    }
  ];
  
  const handleQuickAction = (action) => {
    switch (action) {
      case 'map':
        navigate('/map');
        toast.success('Opening route map...');
        break;
      case 'sos':
        navigate('/sos');
        toast.error('Opening SOS panel...');
        break;
      case 'alerts':
        navigate('/alerts');
        toast('Checking safety alerts...', { icon: '🔔' });
        break;
      case 'profile':
        navigate('/profile');
        toast.success('Opening profile...');
        break;
      case 'analytics':
        navigate('/analytics');
        toast('Loading analytics...', { icon: '📊' });
        break;
      case 'settings':
        navigate('/settings');
        toast.success('Opening settings...');
        break;
      default:
        toast(`${action} feature coming soon!`, { icon: '🚀' });
    }
  };
  
  const toggleLocationTracking = () => {
    if (isTracking) {
      stopTracking();
      toast.success('Location tracking stopped');
    } else {
      startTracking();
      toast.success('Location tracking started');
    }
  };

  return (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Welcome Section */}
      <WelcomeSection
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <WelcomeContent>
          <WelcomeText>
            <WelcomeTitle>
              Welcome back, {user?.name || 'User'}! 👋
            </WelcomeTitle>
            <WelcomeSubtitle>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString()}
            </WelcomeSubtitle>
          </WelcomeText>
          <QuickActions>
            <QuickActionButton
              variant="primary"
              onClick={() => handleQuickAction('map')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MapIcon />
              Find Safe Route
            </QuickActionButton>
            <QuickActionButton
              variant="danger"
              onClick={() => handleQuickAction('sos')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheckIcon />
              Emergency SOS
            </QuickActionButton>
          </QuickActions>
        </WelcomeContent>
      </WelcomeSection>

      {/* Stats Grid */}
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            status={stat.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            onClick={() => handleQuickAction(stat.label.toLowerCase().replace(' ', ''))}
            whileHover={{ scale: 1.02 }}
          >
            <StatIcon status={stat.status}>
              <stat.icon />
            </StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Content Grid */}
      <ContentGrid>
        <MainContent>
          {/* Location Status */}
          <SectionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SectionTitle>
              <MapPinIcon />
              Location & Safety Status
            </SectionTitle>
            
            <LocationCard isActive={isTracking}>
              <h3>{isTracking ? "🟢 Location Tracking Active" : "🔴 Location Tracking Disabled"}</h3>
              <p>
                {isTracking 
                  ? `Current location: ${location?.latitude?.toFixed(4) || 'N/A'}, ${location?.longitude?.toFixed(4) || 'N/A'}`
                  : "Enable location tracking for enhanced safety features"
                }
              </p>
              <ActionButton
                onClick={toggleLocationTracking}
                style={{ marginTop: '1rem' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isTracking ? (
                  <>
                    <PauseIcon />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <PlayIcon />
                    Start Tracking
                  </>
                )}
              </ActionButton>
            </LocationCard>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <SectionTitle>
              <ChartBarIcon />
              Recent Safety Activity
            </SectionTitle>
            
            <ActionButton
              onClick={() => handleQuickAction('analytics')}
              whileHover={{ scale: 1.02 }}
            >
              <span>View Detailed Analytics</span>
              <ChartBarIcon />
            </ActionButton>
            
            <ActionButton
              onClick={() => handleQuickAction('alerts')}
              whileHover={{ scale: 1.02 }}
            >
              <span>Check Safety Alerts</span>
              <BellIcon />
            </ActionButton>
          </SectionCard>
        </MainContent>

        <Sidebar>
          {/* Quick Actions */}
          <SectionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <SectionTitle>
              <Cog6ToothIcon />
              Quick Actions
            </SectionTitle>
            
            <ActionButton
              onClick={() => handleQuickAction('profile')}
              whileHover={{ scale: 1.02 }}
            >
              <span>Edit Profile</span>
              <UserIcon />
            </ActionButton>
            
            <ActionButton
              onClick={() => handleQuickAction('settings')}
              whileHover={{ scale: 1.02 }}
            >
              <span>App Settings</span>
              <Cog6ToothIcon />
            </ActionButton>
            
            <ActionButton
              onClick={() => handleQuickAction('map')}
              whileHover={{ scale: 1.02 }}
            >
              <span>Plan Route</span>
              <MapIcon />
            </ActionButton>
          </SectionCard>

          {/* Emergency Contacts */}
          <SectionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <SectionTitle>
              <PhoneIcon />
              Emergency Ready
            </SectionTitle>
            
            <ActionButton
              onClick={() => {
                window.location.href = 'tel:911';
                toast.error('Calling Emergency Services...');
              }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                background: `linear-gradient(135deg, ${theme?.colors?.error || '#ef4444'}, #dc2626)`,
                color: 'white',
                borderColor: theme?.colors?.error || '#ef4444'
              }}
            >
              <span>Call 911</span>
              <PhoneIcon />
            </ActionButton>
            
            <ActionButton
              onClick={() => handleQuickAction('sos')}
              whileHover={{ scale: 1.02 }}
            >
              <span>Emergency SOS</span>
              <ShieldCheckIcon />
            </ActionButton>
          </SectionCard>
        </Sidebar>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 