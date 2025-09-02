import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  HomeIcon, 
  MapIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiMap } from 'react-icons/fi';

const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: ${props => props.theme?.colors?.glass || 'rgba(30, 41, 59, 0.4)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border-radius: 0 0 20px 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 70px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#818cf8'}, ${props => props.theme?.colors?.secondary || '#a78bfa'});
    border-radius: 50%;
    z-index: -1;
  }
`;

const LogoText = styled(motion.h1)`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  
  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(motion.button)`
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)'};
    border-color: ${props => props.theme?.colors?.primary || '#818cf8'};
  }
`;

const ActiveNavLink = styled(NavLink)`
  background: ${props => props.isActive ? (props.theme?.colors?.primary || '#818cf8') : 'transparent'};
  color: ${props => props.isActive ? 'white' : (props.theme?.colors?.textSecondary || '#cbd5e1')};
  
  &:hover {
    background: ${props => props.isActive ? (props.theme?.colors?.primaryHover || '#6366f1') : (props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)')};
    color: ${props => props.isActive ? 'white' : (props.theme?.colors?.primary || '#818cf8')};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme?.colors?.text || '#f8fafc'};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  padding: 1rem;
  z-index: 999;
  border-radius: 0 0 20px 20px;
`;

const MobileNavLink = styled(motion.button)`
  width: 100%;
  background: ${props => props.isActive ? (props.theme?.colors?.primary || '#818cf8') : 'transparent'};
  color: ${props => props.isActive ? 'white' : (props.theme?.colors?.textSecondary || '#cbd5e1')};
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  text-align: left;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: ${props => props.isActive ? (props.theme?.colors?.primaryHover || '#6366f1') : (props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)')};
    color: ${props => props.isActive ? 'white' : (props.theme?.colors?.primary || '#818cf8')};
  }
`;

const UserAvatar = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme?.colors?.textSecondary || '#cbd5e1'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)'};
    color: ${props => props.theme?.colors?.text || '#f8fafc'};
  }
`;

const IconButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: ${props => props.isActive ? (props.theme?.colors?.primary || '#818cf8') : 'transparent'};
  color: ${props => props.isActive ? 'white' : (props.theme?.colors?.textSecondary || '#cbd5e1')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? (props.theme?.colors?.primaryHover || '#6366f1') : (props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)')};
    color: ${props => props.isActive ? 'white' : (props.theme?.colors?.primary || '#818cf8')};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const UserMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(30, 41, 59, 0.9)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  backdrop-filter: blur(20px);
  padding: 0.5rem;
  min-width: 200px;
  z-index: 10;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => props.theme?.colors?.textSecondary || '#cbd5e1'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(129, 140, 248, 0.1)'};
    color: ${props => props.theme?.colors?.text || '#f8fafc'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Map', path: '/map', icon: MapIcon },
  { name: 'SOS', path: '/sos', icon: ShieldCheckIcon },
  { name: 'Alerts', path: '/alerts', icon: ExclamationTriangleIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
];

const Navbar = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menus when location changes
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <NavbarContainer
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <LogoSection>
                    <LogoIcon>SRN</LogoIcon>
        <LogoText>SafeRoute</LogoText>
      </LogoSection>

      <NavLinks>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ActiveNavLink
              key={item.name}
              onClick={() => navigate(item.path)}
              isActive={isActive}
            >
              <Icon />
              <span>{item.name}</span>
            </ActiveNavLink>
          );
        })}

      </NavLinks>

      <UserSection>
        <IconButton
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>

        <div style={{ position: 'relative' }}>
          <IconButton
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            isActive={isUserMenuOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserCircleIcon />
          </IconButton>

          <AnimatePresence>
            {isUserMenuOpen && (
              <UserMenu
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <UserCircleIcon />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                  <Cog6ToothIcon />
                  Settings
                </MenuItem>
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: `1px solid ${theme?.colors?.border || 'rgba(255, 255, 255, 0.1)'}` }} />
                <MenuItem onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon />
                  Sign Out
                </MenuItem>
              </UserMenu>
            )}
          </AnimatePresence>
        </div>

        <MobileMenuButton
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
        </MobileMenuButton>
      </UserSection>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <MobileNavLink
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  isActive={isActive}
                >
                  <Icon />
                  <span>{item.name}</span>
                </MobileNavLink>
              );
            })}
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

export default Navbar; 