import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PencilIcon,
  CogIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  BellIcon,
  EyeIcon,
  KeyIcon,
  CameraIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  PaintBrushIcon,
  LockClosedIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  HeartIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Styled Components
const ProfileContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const BackButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    transform: translateX(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProfileLayout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  margin: 0 auto 1.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }
  
  .edit-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    svg {
      width: 24px;
      height: 24px;
      color: white;
    }
  }
  
  &:hover .edit-overlay {
    opacity: 1;
  }
`;

const UserInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .name {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    margin-bottom: 0.5rem;
  }
  
  .email {
    color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
    margin-bottom: 0.5rem;
  }
  
  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.theme?.colors?.success || '#10b981'}20;
    color: ${props => props.theme?.colors?.success || '#10b981'};
    border-radius: ${props => props.theme?.borderRadius?.full || '9999px'};
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1rem;
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
  
  .label {
    font-size: 0.8rem;
    color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
    margin-top: 0.25rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const TabButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 
    `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})` :
    props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'
  };
  color: ${props => props.active ? 'white' : (props.theme?.colors?.text || '#f8f9ff')};
  border: 1px solid ${props => props.active ? 
    'transparent' : 
    (props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)')
  };
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? 
      `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})` :
      props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'
    };
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabContent = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
`;

const SectionTitle = styled.h2`
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormField = styled.div`
  .label {
    display: block;
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
    border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
    border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
      box-shadow: 0 0 0 3px ${props => props.theme?.colors?.primary || '#8b5cf6'}20;
    }
    
    &::placeholder {
      color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
    }
  }
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  margin-bottom: 1rem;
  
  .toggle-info {
    .title {
      color: ${props => props.theme?.colors?.text || '#f8f9ff'};
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .description {
      color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
      font-size: 0.85rem;
    }
  }
  
  .toggle-button {
    position: relative;
    width: 48px;
    height: 24px;
    background: ${props => props.active ? 
      `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.accent || '#ec4899'})` :
      props.theme?.colors?.disabled || '#64748b'
    };
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: ${props => props.active ? '26px' : '2px'};
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${props => {
    if (props.variant === 'danger') return `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}, #dc2626)`;
    if (props.variant === 'success') return `linear-gradient(135deg, ${props.theme?.colors?.success || '#10b981'}, #059669)`;
    return `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})`;
  }};
  color: white;
  border: none;
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmergencyContactCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1.5rem;
  margin-bottom: 1rem;
  
  .contact-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    .contact-name {
      font-weight: 600;
      color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    }
    
    .actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .contact-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    
    .detail {
      .label {
        font-size: 0.8rem;
        color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
        margin-bottom: 0.25rem;
      }
      
      .value {
        color: ${props => props.theme?.colors?.text || '#f8f9ff'};
        font-weight: 500;
      }
    }
  }
`;

const ThemeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ThemeOption = styled(motion.div)`
  padding: 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 2px solid ${props => props.active ? 
    (props.theme?.colors?.primary || '#8b5cf6') : 
    (props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)')
  };
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    transform: translateY(-2px);
  }
  
  .theme-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .theme-name {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    font-weight: 500;
    font-size: 0.9rem;
  }
`;

const Profile = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@saferoute.com',
    phone: user?.phone || '+91-9876543210',
    emergencyContact: user?.emergency_contact || '+91-9876543211',
    location: 'Varanasi, India',
    bio: 'Safety-conscious traveler who loves exploring with peace of mind.',
    language: 'English',
    timezone: 'Asia/Kolkata'
  });
  
  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    emergencyAlerts: true,
    safetyReminders: true,
    darkMode: isDarkMode,
    autoBackup: true,
    biometricAuth: false,
    twoFactorAuth: false
  });
  
  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      name: 'Family Contact',
      phone: '+91-9876543211',
      relationship: 'Family',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Best Friend',
      phone: '+91-9876543212',
      relationship: 'Friend',
      priority: 'Medium'
    }
  ]);
  
  const [safetyStats] = useState({
    totalTrips: 47,
    safeTrips: 45,
    alertsReceived: 23,
    emergencyContacts: emergencyContacts.length,
    safetyScore: 96,
    lastActivity: '2 hours ago'
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'emergency', label: 'Emergency Contacts', icon: PhoneIcon },
    { id: 'safety', label: 'Safety Stats', icon: ChartBarIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon }
  ];

  const handleSave = (section) => {
    toast.success(`${section} settings saved successfully!`);
  };

  const handleToggleSetting = (setting) => {
    if (setting === 'darkMode') {
      toggleTheme();
      setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    } else {
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
    toast.success(`${setting} ${settings[setting] ? 'disabled' : 'enabled'}`);
  };

  const handleAddEmergencyContact = () => {
    const newContact = {
      id: Date.now(),
      name: 'New Contact',
      phone: '+91-XXXXXXXXXX',
      relationship: 'Other',
      priority: 'Low'
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
  };

  const handleRemoveEmergencyContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    toast.success('Emergency contact removed');
  };

  const renderPersonalInfo = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <UserIcon />
        Personal Information
      </SectionTitle>
      
      <FormGrid>
        <FormField>
          <label className="label">Full Name</label>
          <input
            type="text"
            className="input"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
          />
        </FormField>
        
        <FormField>
          <label className="label">Email Address</label>
          <input
            type="email"
            className="input"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email"
          />
        </FormField>
        
        <FormField>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            className="input"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter your phone number"
          />
        </FormField>
        
        <FormField>
          <label className="label">Location</label>
          <input
            type="text"
            className="input"
            value={profileData.location}
            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Enter your location"
          />
        </FormField>
        
        <FormField>
          <label className="label">Preferred Language</label>
          <select
            className="input"
            value={profileData.language}
            onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
          </select>
        </FormField>
        
        <FormField>
          <label className="label">Timezone</label>
          <select
            className="input"
            value={profileData.timezone}
            onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Mumbai">Asia/Mumbai</option>
            <option value="Asia/Delhi">Asia/Delhi</option>
          </select>
        </FormField>
      </FormGrid>
      
      <FormField>
        <label className="label">Bio</label>
        <textarea
          className="input"
          rows="3"
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us about yourself..."
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </FormField>
      
      <ActionButton
        onClick={() => handleSave('Personal Information')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CheckIcon />
        Save Personal Info
      </ActionButton>
    </TabContent>
  );

  const renderSecurity = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <ShieldCheckIcon />
        Security & Privacy
      </SectionTitle>
      
      <ToggleSwitch 
        active={settings.twoFactorAuth}
        onClick={() => handleToggleSetting('twoFactorAuth')}
      >
        <div className="toggle-info">
          <div className="title">Two-Factor Authentication</div>
          <div className="description">Add an extra layer of security to your account</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ToggleSwitch 
        active={settings.biometricAuth}
        onClick={() => handleToggleSetting('biometricAuth')}
      >
        <div className="toggle-info">
          <div className="title">Biometric Authentication</div>
          <div className="description">Use fingerprint or face recognition</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ToggleSwitch 
        active={settings.autoBackup}
        onClick={() => handleToggleSetting('autoBackup')}
      >
        <div className="toggle-info">
          <div className="title">Automatic Data Backup</div>
          <div className="description">Automatically backup your safety data</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <ActionButton
          onClick={() => toast.success('Password change email sent!')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <KeyIcon />
          Change Password
        </ActionButton>
        
        <ActionButton
          variant="danger"
          onClick={() => toast.error('Account export started')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <InformationCircleIcon />
          Export Data
        </ActionButton>
      </div>
    </TabContent>
  );

  const renderPreferences = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <CogIcon />
        App Preferences
      </SectionTitle>
      
      <ToggleSwitch 
        active={settings.notifications}
        onClick={() => handleToggleSetting('notifications')}
      >
        <div className="toggle-info">
          <div className="title">Push Notifications</div>
          <div className="description">Receive safety alerts and updates</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ToggleSwitch 
        active={settings.locationSharing}
        onClick={() => handleToggleSetting('locationSharing')}
      >
        <div className="toggle-info">
          <div className="title">Location Sharing</div>
          <div className="description">Share location with emergency contacts</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ToggleSwitch 
        active={settings.emergencyAlerts}
        onClick={() => handleToggleSetting('emergencyAlerts')}
      >
        <div className="toggle-info">
          <div className="title">Emergency Alerts</div>
          <div className="description">Receive critical safety alerts in your area</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ToggleSwitch 
        active={settings.safetyReminders}
        onClick={() => handleToggleSetting('safetyReminders')}
      >
        <div className="toggle-info">
          <div className="title">Safety Reminders</div>
          <div className="description">Get reminders for safety check-ins</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ActionButton
        onClick={() => handleSave('Preferences')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CheckIcon />
        Save Preferences
      </ActionButton>
    </TabContent>
  );

  const renderEmergencyContacts = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <PhoneIcon />
        Emergency Contacts
      </SectionTitle>
      
      {emergencyContacts.map((contact) => (
        <EmergencyContactCard
          key={contact.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="contact-header">
            <div className="contact-name">{contact.name}</div>
            <div className="actions">
              <ActionButton
                style={{ padding: '0.5rem' }}
                onClick={() => toast.success('Contact edited')}
              >
                <PencilIcon />
              </ActionButton>
              <ActionButton
                variant="danger"
                style={{ padding: '0.5rem' }}
                onClick={() => handleRemoveEmergencyContact(contact.id)}
              >
                <XMarkIcon />
              </ActionButton>
            </div>
          </div>
          <div className="contact-details">
            <div className="detail">
              <div className="label">Phone</div>
              <div className="value">{contact.phone}</div>
            </div>
            <div className="detail">
              <div className="label">Relationship</div>
              <div className="value">{contact.relationship}</div>
            </div>
            <div className="detail">
              <div className="label">Priority</div>
              <div className="value">{contact.priority}</div>
            </div>
          </div>
        </EmergencyContactCard>
      ))}
      
      <ActionButton
        onClick={handleAddEmergencyContact}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <PhoneIcon />
        Add Emergency Contact
      </ActionButton>
    </TabContent>
  );

  const renderSafetyStats = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <ChartBarIcon />
        Safety Statistics
      </SectionTitle>
      
      <FormGrid>
        <StatCard>
          <div className="value">{safetyStats.totalTrips}</div>
          <div className="label">Total Trips</div>
        </StatCard>
        <StatCard>
          <div className="value">{safetyStats.safeTrips}</div>
          <div className="label">Safe Trips</div>
        </StatCard>
        <StatCard>
          <div className="value">{safetyStats.safetyScore}%</div>
          <div className="label">Safety Score</div>
        </StatCard>
        <StatCard>
          <div className="value">{safetyStats.alertsReceived}</div>
          <div className="label">Alerts Received</div>
        </StatCard>
      </FormGrid>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ 
          padding: '1rem', 
          background: theme?.colors?.surface, 
          borderRadius: theme?.borderRadius?.lg,
          border: `1px solid ${theme?.colors?.border}`
        }}>
          <div style={{ color: theme?.colors?.text, fontWeight: '600', marginBottom: '0.5rem' }}>
            🏆 Safety Achievements
          </div>
          <div style={{ color: theme?.colors?.textSecondary, fontSize: '0.9rem' }}>
            • Perfect Safety Score for 30 days<br/>
            • 45 consecutive safe trips<br/>
            • Emergency contacts verified<br/>
            • Real-time location sharing active
          </div>
        </div>
        
        <div style={{ 
          padding: '1rem', 
          background: theme?.colors?.surface, 
          borderRadius: theme?.borderRadius?.lg,
          border: `1px solid ${theme?.colors?.border}`
        }}>
          <div style={{ color: theme?.colors?.text, fontWeight: '600', marginBottom: '0.5rem' }}>
            📍 Recent Activity
          </div>
          <div style={{ color: theme?.colors?.textSecondary, fontSize: '0.9rem' }}>
            Last safety check-in: {safetyStats.lastActivity}<br/>
            Most visited safe zone: Dashashwamedh Ghat<br/>
            Preferred travel time: 10 AM - 4 PM
          </div>
        </div>
      </div>
    </TabContent>
  );

  const renderAppearance = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionTitle>
        <PaintBrushIcon />
        Appearance & Theme
      </SectionTitle>
      
      <ThemeSelector>
        <ThemeOption
          active={isDarkMode}
          onClick={() => !isDarkMode && toggleTheme()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="theme-icon">🌙</div>
          <div className="theme-name">Dark Theme</div>
        </ThemeOption>
        
        <ThemeOption
          active={!isDarkMode}
          onClick={() => isDarkMode && toggleTheme()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="theme-icon">☀️</div>
          <div className="theme-name">Light Theme</div>
        </ThemeOption>
        
        <ThemeOption
          active={false}
          onClick={() => toast.success('Auto theme coming soon!')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="theme-icon">🌓</div>
          <div className="theme-name">Auto</div>
        </ThemeOption>
      </ThemeSelector>
      
      <ToggleSwitch 
        active={settings.darkMode}
        onClick={() => handleToggleSetting('darkMode')}
      >
        <div className="toggle-info">
          <div className="title">Dark Mode</div>
          <div className="description">Use dark theme for better night viewing</div>
        </div>
        <div className="toggle-button" />
      </ToggleSwitch>
      
      <ActionButton
        onClick={() => toast.success('Theme preferences saved!')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CheckIcon />
        Save Theme Settings
      </ActionButton>
    </TabContent>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'security': return renderSecurity();
      case 'preferences': return renderPreferences();
      case 'emergency': return renderEmergencyContacts();
      case 'safety': return renderSafetyStats();
      case 'appearance': return renderAppearance();
      default: return renderPersonalInfo();
    }
  };

  return (
    <ProfileContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Header>
        <BackButton
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon />
          Back to Dashboard
        </BackButton>
        <Title>👤 User Profile</Title>
      </Header>

      <ProfileLayout>
        <ProfileSidebar
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProfileAvatar onClick={() => toast.success('Avatar upload coming soon!')}>
            <UserIcon style={{ width: '3rem', height: '3rem' }} />
            <div className="edit-overlay">
              <CameraIcon />
            </div>
          </ProfileAvatar>
          
          <UserInfo>
            <div className="name">{profileData.name}</div>
            <div className="email">{profileData.email}</div>
            <div className="status">
              <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
              Verified User
            </div>
          </UserInfo>
          
          <QuickStats>
            <StatCard>
              <div className="value">{safetyStats.safetyScore}%</div>
              <div className="label">Safety Score</div>
            </StatCard>
            <StatCard>
              <div className="value">{safetyStats.totalTrips}</div>
              <div className="label">Total Trips</div>
            </StatCard>
            <StatCard>
              <div className="value">{emergencyContacts.length}</div>
              <div className="label">Contacts</div>
            </StatCard>
            <StatCard>
              <div className="value">Active</div>
              <div className="label">Status</div>
            </StatCard>
          </QuickStats>
        </ProfileSidebar>

        <MainContent>
          <TabNavigation>
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon />
                {tab.label}
              </TabButton>
            ))}
          </TabNavigation>

          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </MainContent>
      </ProfileLayout>
    </ProfileContainer>
  );
};

export default Profile; 