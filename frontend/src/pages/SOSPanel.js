import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  PhoneIcon,
  ShieldExclamationIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  SpeakerWaveIcon,
  CameraIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useGeolocation } from '../context/GeolocationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Styled Components with Violet-Black Theme
const SOSContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;

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
  background: linear-gradient(135deg, ${props => props.theme?.colors?.error || '#ef4444'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EmergencyAlert = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.theme?.colors?.error || '#ef4444'}20, ${props => props.theme?.colors?.error || '#ef4444'}10);
  border: 2px solid ${props => props.theme?.colors?.error || '#ef4444'}60;
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { left: -100%; }
    50% { left: 100%; }
  }
`;

const EmergencyText = styled.h2`
  color: ${props => props.theme?.colors?.error || '#ef4444'};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const MainSOSButton = styled(motion.button)`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.error || '#ef4444'}, #dc2626);
  border: 4px solid white;
  color: white;
  font-size: 2rem;
  font-weight: 800;
  cursor: pointer;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 
    0 0 30px ${props => props.theme?.colors?.error || '#ef4444'}60,
    0 0 60px ${props => props.theme?.colors?.error || '#ef4444'}40,
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    background: linear-gradient(45deg, ${props => props.theme?.colors?.error || '#ef4444'}, #dc2626, ${props => props.theme?.colors?.error || '#ef4444'});
    border-radius: 50%;
    z-index: -1;
    filter: blur(8px);
    opacity: 0.8;
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    from { transform: scale(1); opacity: 0.8; }
    to { transform: scale(1.1); opacity: 1; }
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 
      0 0 40px ${props => props.theme?.colors?.error || '#ef4444'}80,
      0 0 80px ${props => props.theme?.colors?.error || '#ef4444'}60;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CountdownOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  z-index: 10;
`;

const CountdownNumber = styled(motion.div)`
  font-size: 4rem;
  font-weight: 900;
  color: ${props => props.theme?.colors?.error || '#ef4444'};
  margin-bottom: 1rem;
`;

const CancelButton = styled(motion.button)`
  padding: 1rem 2rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 2px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const QuickActionCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    background: ${props => props.theme?.colors?.glassHover || 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.15) 100%)'};
    border-color: ${props => props.theme?.colors?.borderHover || 'rgba(139, 92, 246, 0.6)'};
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => {
    if (props.variant === 'danger') return `linear-gradient(135deg, ${props.theme?.colors?.error || '#ef4444'}, #dc2626)`;
    if (props.variant === 'warning') return `linear-gradient(135deg, ${props.theme?.colors?.warning || '#f59e0b'}, #d97706)`;
    return `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})`;
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme?.shadows?.md || '0 8px 16px -2px rgba(139, 92, 246, 0.3)'};
  
  svg {
    width: 30px;
    height: 30px;
  }
`;

const ActionTitle = styled.h3`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const ActionDescription = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  margin: 0;
  font-size: 0.9rem;
`;

const LocationSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const LocationInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1rem;
  
  .label {
    color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
  
  .value {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    font-weight: 600;
  }
`;

const SOSPanel = () => {
  const { theme } = useTheme();
  const { location } = useGeolocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      handleEmergencyCall();
    }
    
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  const handleSOSPress = () => {
    setIsCountingDown(true);
    setCountdown(5);
    toast.error('Emergency call starting in 5 seconds...');
  };

  const handleCancel = () => {
    setIsCountingDown(false);
    setCountdown(5);
    toast.success('Emergency call cancelled');
  };

  const handleEmergencyCall = () => {
    setIsCountingDown(false);
    setCountdown(5);
    window.location.href = 'tel:911';
    toast.error('Calling Emergency Services...');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'call911':
        window.location.href = 'tel:911';
        toast.error('Calling 911...');
        break;
      case 'police':
        window.location.href = 'tel:100'; // Indian Police number
        toast.error('Calling Police (100)...');
        break;
      case 'fire':
        window.location.href = 'tel:101'; // Indian Fire services
        toast.error('Calling Fire Department (101)...');
        break;
      case 'medical':
        window.location.href = 'tel:108'; // Indian Medical Emergency
        toast.error('Calling Medical Emergency (108)...');
        break;
      case 'contacts':
        handleEmergencyContacts();
        break;
      case 'location':
        handleLocationShare();
        break;
      case 'alarm':
        handleSoundAlarm();
        break;
      case 'message':
        handleEmergencyMessage();
        break;
      case 'camera':
        handleEmergencyPhoto();
        break;
      case 'record':
        handleEmergencyRecording();
        break;
      default:
        toast(`${action} feature activated`, { icon: 'Alert' });
    }
  };

  const handleEmergencyContacts = () => {
    const emergencyContacts = [
      { name: 'Emergency Contact 1', number: user?.emergency_contact || '+91-9876543210' },
      { name: 'Family', number: '+91-9876543211' },
      { name: 'Friend', number: '+91-9876543212' },
      { name: 'Local Police', number: '100' },
      { name: 'Safety Helpline', number: '1091' }
    ];

    const contactsMessage = emergencyContacts.map(contact => 
      `${contact.name}: ${contact.number}`
    ).join('\n');

    // Show contacts in a toast
          toast(`Emergency Contacts:\n${contactsMessage}`, {
      duration: 8000,
      style: {
        maxWidth: '400px',
        whiteSpace: 'pre-line'
      }
    });

    // Call first emergency contact
    if (emergencyContacts[0]) {
      setTimeout(() => {
        window.location.href = `tel:${emergencyContacts[0].number}`;
      }, 2000);
    }
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationText = `Emergency Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          // Copy to clipboard
          navigator.clipboard.writeText(`${locationText}\nGoogle Maps: ${mapsLink}`).then(() => {
            toast.success('Location copied to clipboard!');
          });

          // Also try to share via Web Share API
          if (navigator.share) {
            navigator.share({
              title: 'Emergency Location',
              text: `I need help! My location: ${locationText}`,
              url: mapsLink
            }).catch(() => {
              console.log('Share cancelled');
            });
          }

          // Send SMS if available
          const smsText = `EMERGENCY: I need help! My location: ${mapsLink}`;
          window.open(`sms:${user?.emergency_contact || ''}?body=${encodeURIComponent(smsText)}`);
        },
        (error) => {
          toast.error('Could not get location. Please enable GPS.');
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  const handleSoundAlarm = () => {
    // Create audio context for alarm sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playAlarmSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.5);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
      };

      // Play alarm multiple times
      for (let i = 0; i < 10; i++) {
        setTimeout(() => playAlarmSound(), i * 1200);
      }

              toast.error('EMERGENCY ALARM ACTIVATED!', {
        duration: 10000,
        style: {
          background: '#ef4444',
          color: 'white'
        }
      });

      // Also try to vibrate phone if supported
      if (navigator.vibrate) {
        const pattern = [200, 100, 200, 100, 200, 100, 200];
        for (let i = 0; i < 5; i++) {
          setTimeout(() => navigator.vibrate(pattern), i * 2000);
        }
      }

    } catch (error) {
      console.error('Audio alarm error:', error);
      toast.error('Could not play alarm sound');
    }
  };

  const handleEmergencyMessage = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const emergencyMessage = `EMERGENCY ALERT\n\nI need immediate help!\n\nLocation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nGoogle Maps: https://maps.google.com/?q=${latitude},${longitude}\n\nTime: ${new Date().toLocaleString()}\n\nSent from SafeRoute Navigator`;
          
          // Send via SMS
          const phoneNumbers = [
            user?.emergency_contact || '+91-9876543210',
            '+91-9876543211', // Add more emergency contacts
            '+91-9876543212'
          ];

          phoneNumbers.forEach((number, index) => {
            setTimeout(() => {
              window.open(`sms:${number}?body=${encodeURIComponent(emergencyMessage)}`);
            }, index * 1000);
          });

          toast.success('Emergency messages sent to contacts!');
        },
        (error) => {
          const emergencyMessage = `EMERGENCY ALERT\n\nI need immediate help!\n\nLocation: Unable to determine\nTime: ${new Date().toLocaleString()}\n\nSent from SafeRoute Navigator`;
          window.open(`sms:${user?.emergency_contact || ''}?body=${encodeURIComponent(emergencyMessage)}`);
          toast.error('Sent emergency message without location');
        }
      );
    }
  };

  const handleEmergencyPhoto = () => {
    // Try to access camera for emergency photo
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Create a simple photo capture interface
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          toast.success('📸 Camera activated for emergency photo', {
            duration: 5000
          });

          // Stop the stream after 5 seconds (just for demonstration)
          setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
          }, 5000);
        })
        .catch((error) => {
          console.error('Camera access error:', error);
          toast.error('Could not access camera');
        });
    } else {
      toast.error('Camera not supported by this browser');
    }
  };

  const handleEmergencyRecording = () => {
    // Try to access microphone for emergency recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `emergency-recording-${Date.now()}.wav`;
            a.click();

            stream.getTracks().forEach(track => track.stop());
            toast.success('Emergency recording saved!');
          };

          mediaRecorder.start();
          toast.error('Recording emergency audio...', {
            duration: 10000
          });

          // Stop recording after 10 seconds
          setTimeout(() => {
            mediaRecorder.stop();
          }, 10000);
        })
        .catch((error) => {
          console.error('Microphone access error:', error);
          toast.error('Could not access microphone');
        });
    } else {
      toast.error('Audio recording not supported by this browser');
    }
  };

  const quickActions = [
    {
      id: 'call911',
      title: 'Call Emergency',
      description: 'Direct emergency services call',
      icon: PhoneIcon,
      variant: 'danger'
    },
    {
      id: 'police',
      title: 'Police (100)',
      description: 'Law enforcement assistance',
      icon: ShieldExclamationIcon,
      variant: 'danger'
    },
    {
      id: 'medical',
      title: 'Medical (108)',
      description: 'Ambulance & medical emergency',
      icon: UserIcon,
      variant: 'danger'
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      description: 'Call saved emergency contacts',
      icon: PhoneIcon,
      variant: 'warning'
    },
    {
      id: 'location',
      title: 'Share Location',
      description: 'Send GPS location via SMS',
      icon: MapPinIcon,
      variant: 'primary'
    },
    {
      id: 'alarm',
      title: 'Sound Alarm',
      description: 'Loud emergency siren + vibration',
      icon: SpeakerWaveIcon,
      variant: 'warning'
    },
    {
      id: 'message',
      title: 'Emergency SMS',
      description: 'Send emergency message to contacts',
      icon: PhoneIcon,
      variant: 'primary'
    },
    {
      id: 'camera',
      title: 'Emergency Photo',
      description: 'Activate camera for evidence',
      icon: CameraIcon,
      variant: 'primary'
    },
    {
      id: 'record',
      title: 'Audio Recording',
      description: 'Record emergency audio evidence',
      icon: MicrophoneIcon,
      variant: 'primary'
    }
  ];

  return (
    <SOSContainer
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
        <Title>Emergency SOS</Title>
      </Header>

      <EmergencyAlert
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <EmergencyText>Emergency Response Ready</EmergencyText>
        <p style={{ color: theme?.colors?.textSecondary, margin: 0 }}>
          Press and hold the SOS button below to initiate emergency call
        </p>
        
        <MainSOSButton
          onMouseDown={handleSOSPress}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShieldExclamationIcon style={{ width: '60px', height: '60px' }} />
          <span>SOS</span>
          
          <AnimatePresence>
            {isCountingDown && (
              <CountdownOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CountdownNumber
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {countdown}
                </CountdownNumber>
                <CancelButton
                  onClick={handleCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </CancelButton>
              </CountdownOverlay>
            )}
          </AnimatePresence>
        </MainSOSButton>
      </EmergencyAlert>

      <QuickActionsGrid>
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            onClick={() => handleQuickAction(action.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon variant={action.variant}>
              <action.icon />
            </ActionIcon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
          </QuickActionCard>
        ))}
      </QuickActionsGrid>

      <LocationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <SectionTitle>
          <MapPinIcon />
          Current Status & Location
        </SectionTitle>
        
        <LocationInfo>
          <InfoCard>
            <div className="label">Current Time</div>
            <div className="value">{currentTime.toLocaleTimeString()}</div>
          </InfoCard>
          
          <InfoCard>
            <div className="label">Date</div>
            <div className="value">{currentTime.toLocaleDateString()}</div>
          </InfoCard>
          
          <InfoCard>
            <div className="label">User</div>
            <div className="value">{user?.name || 'Demo User'}</div>
          </InfoCard>
          
          <InfoCard>
            <div className="label">Location</div>
            <div className="value">
              {location 
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'Location not available'
              }
            </div>
          </InfoCard>
        </LocationInfo>
      </LocationSection>
    </SOSContainer>
  );
};

export default SOSPanel; 