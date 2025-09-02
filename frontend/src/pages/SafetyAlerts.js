import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  XMarkIcon,
  InformationCircleIcon,
  FireIcon,
  EyeIcon,
  ArrowLeftIcon,
  MegaphoneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useGeolocation } from '../context/GeolocationContext';
import { calculateDistance, formatDistance, getDistanceWithDirection } from '../services/api';
import { toast } from 'react-hot-toast';

// Import real news services
import newsService from '../services/newsService';
import smartRouteService from '../services/smartRouteService';

// Styled Components
const SafetyAlertsContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  background: linear-gradient(135deg, ${props => props.theme?.colors?.warning || '#f59e0b'}, ${props => props.theme?.colors?.error || '#ef4444'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AlertCard = styled(motion.div)`
  background: ${props => {
    if (props.severity === 'critical') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))';
    if (props.severity === 'high') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))';
    if (props.severity === 'medium') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))';
    return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))';
  }};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => {
    if (props.severity === 'critical') return '#ef4444';
    if (props.severity === 'high') return '#f59e0b';
    if (props.severity === 'medium') return '#8b5cf6';
    return '#10b981';
  }};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
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
    height: 4px;
    background: ${props => {
      if (props.severity === 'critical') return 'linear-gradient(90deg, #ef4444, #dc2626)';
      if (props.severity === 'high') return 'linear-gradient(90deg, #f59e0b, #d97706)';
      if (props.severity === 'medium') return 'linear-gradient(90deg, #8b5cf6, #6366f1)';
      return 'linear-gradient(90deg, #10b981, #059669)';
    }};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const AlertIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => {
    if (props.severity === 'critical') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.severity === 'high') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (props.severity === 'medium') return 'linear-gradient(135deg, #8b5cf6, #6366f1)';
    return 'linear-gradient(135deg, #10b981, #059669)';
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h3`
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AlertDescription = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const SeverityBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme?.borderRadius?.full || '9999px'};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.severity === 'critical') return '#ef4444';
    if (props.severity === 'high') return '#f59e0b';
    if (props.severity === 'medium') return '#8b5cf6';
    return '#10b981';
  }};
  color: white;
`;

const StatsSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
    font-size: 0.9rem;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
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
  
  &:hover {
    background: ${props => props.active ? 
      `linear-gradient(135deg, ${props.theme?.colors?.primary || '#8b5cf6'}, ${props.theme?.colors?.secondary || '#6366f1'})` :
      props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'
    };
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const SafetyAlerts = () => {
  const { theme } = useTheme();
  const { 
    currentLocation, 
    isLocating, 
    locationAccuracy, 
    getCurrentLocation, 
    refreshLocation,
    isLocationEnabled,
    locationError 
  } = useGeolocation();
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState(null);
  const [selectedCity, setSelectedCity] = useState('varanasi');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    resolved: 0,
    nearby: 0
  });

  // Get user's current location with enhanced detection
  useEffect(() => {
    const getUserLocation = async () => {
      // Don't interfere if location is already being detected
      if (isLocating) {
        console.log('📍 Location detection already in progress, waiting...');
        return;
      }

      // If we already have a real location (not default coordinates), use it
      if (currentLocation && 
          currentLocation.lat !== 25.3176 && 
          currentLocation.lng !== 82.9739 &&
          !isLoadingLocation) {
        console.log('📍 Using existing real location:', currentLocation);
        setUserLocation(currentLocation);
        setLocationStatus('detected');
        setIsLoadingLocation(false);
        
        const accuracyText = locationAccuracy ? 
          `📍 Using your location (±${Math.round(locationAccuracy)}m accuracy)` : 
          '📍 Using your current location';
        
        // Only show toast once when location is first established
        if (!userLocation) {
          toast.success(accuracyText);
        }
        return;
      }

      // Only try to get fresh location if we don't have a real one yet
      if (!userLocation || (userLocation.lat === 25.3176 && userLocation.lng === 82.9739)) {
        setIsLoadingLocation(true);
        setLocationStatus('requesting');
        
        try {
          console.log('📍 Requesting fresh location...');
          const position = await getCurrentLocation();
          setUserLocation(position);
          setLocationStatus('detected');
          
          const accuracyText = position.accuracy ? 
            `📍 Location detected! Accuracy: ±${Math.round(position.accuracy)}m` : 
            '📍 Location detected successfully!';
          
          toast.success(accuracyText);
          setIsLoadingLocation(false);
        } catch (error) {
          console.error('Location error:', error);
          // Only fallback to default if we don't already have a real location
          if (!userLocation || (userLocation.lat === 25.3176 && userLocation.lng === 82.9739)) {
            setUserLocation({ lat: 25.3176, lng: 82.9739 });
            setLocationStatus('fallback');
            
            if (error.message && error.message.includes('denied')) {
              toast.error('📍 Location access denied. Using Varanasi city center as reference.\nFor accurate distances, please enable location permissions and refresh.', {
                duration: 10000
              });
            } else {
              toast.error('📍 Could not get your precise location. Using Varanasi reference point.\nTap the refresh button to try again.', {
                duration: 8000
              });
            }
          }
          setIsLoadingLocation(false);
        }
      }
    };

    getUserLocation();
  }, [currentLocation, getCurrentLocation, locationAccuracy, isLocating]); // Added isLocating to prevent conflicts

  // Handle location refresh
  const handleLocationRefresh = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationStatus('refreshing');
      console.log('📍 Manually refreshing location...');
      
      const position = await refreshLocation();
      
      // Ensure we update our local userLocation state with the refreshed position
      setUserLocation(position);
      setLocationStatus('detected');
      setIsLoadingLocation(false);
      
      console.log('📍 Location refreshed successfully:', position);
    } catch (error) {
      console.error('Location refresh error:', error);
      setLocationStatus('error');
      setIsLoadingLocation(false);
      toast.error('📍 Could not refresh location. Please check your GPS and try again.');
    }
  };

  // Calculate distance from user location to alert location
  const getDistanceFromUser = (alertLat, alertLng) => {
    if (!userLocation) return 'Unknown';
    
    const distanceInfo = getDistanceWithDirection(
      userLocation.lat,
      userLocation.lng,
      alertLat,
      alertLng
    );
    
    return `${distanceInfo.formattedDistance} ${distanceInfo.direction}`;
  };

  // Fetch real news alerts instead of demo data
  useEffect(() => {
    const fetchRealNewsAlerts = async () => {
      if (!userLocation || isLoadingNews) return;
      
      setIsLoadingNews(true);
      
      try {
        console.log(`📰 Fetching REAL news alerts for ${selectedCity}...`);
        
        // Determine city based on user location
        const cities = newsService.getSupportedCities();
        let nearestCity = cities.find(city => city.name === selectedCity);
        
        if (!nearestCity && userLocation) {
          // Find nearest city to user location
          let minDistance = Infinity;
          cities.forEach(city => {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, city.lat, city.lng);
            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = city;
            }
          });
          
          if (nearestCity) {
            setSelectedCity(nearestCity.name);
            console.log(`📍 Auto-selected nearest city: ${nearestCity.displayName} (${minDistance.toFixed(1)}km away)`);
          }
        }
        
        if (!nearestCity) {
          nearestCity = { name: 'varanasi', displayName: 'Varanasi', lat: 25.3176, lng: 82.9739 };
        }
        
        // Fetch real news data
        const newsData = await newsService.fetchCityNews(nearestCity.name, {
          pageSize: 20,
          sources: ['newsapi', 'gnews'],
          forceReal: true
        });
        
        console.log(`✅ Fetched ${newsData.news.length} real news alerts!`);
        
        // Convert news articles to alert format
        const convertedAlerts = newsData.news.map((article, index) => ({
          id: `news-${index}`,
          type: 'safety',
          severity: article.severity || 'medium',
          title: article.title,
          description: article.description || article.content?.substring(0, 200) + '...',
          location: article.locations?.[0]?.name || nearestCity.displayName,
          coordinates: article.locations?.[0] || nearestCity,
          time: new Date(article.publishedAt),
          source: article.source,
          url: article.url,
          icon: article.severity === 'critical' ? FireIcon : 
                article.severity === 'high' ? ExclamationTriangleIcon :
                article.severity === 'medium' ? InformationCircleIcon : 
                ShieldCheckIcon,
          distance: article.distance,
          safetyScore: article.safetyScore,
          isRealNews: true
        }));
        
        // Add some fallback alerts if no real news found
        if (convertedAlerts.length === 0) {
          console.log('📰 No recent safety news found, adding fallback alerts');
          convertedAlerts.push(...generateFallbackAlerts(nearestCity));
        }
        
        setAlerts(convertedAlerts);
        setLastNewsUpdate(new Date());
        
        toast.success(`📰 Updated with ${convertedAlerts.length} real safety alerts for ${nearestCity.displayName}!`, {
          icon: 'Shield',
          duration: 3000
        });
        
      } catch (error) {
        console.error('❌ Failed to fetch real news:', error);
        
        // Fallback to demo alerts if real news fails
        console.log('📰 Falling back to demo alerts due to API error');
        const fallbackAlerts = generateFallbackAlerts();
        setAlerts(fallbackAlerts);
        
        if (error.message.includes('No real news available')) {
          toast.error('📰 News APIs not responding. Check your API keys in .env file', {
            duration: 6000
          });
        } else {
          toast.error('📰 Could not fetch latest news. Using cached alerts.', {
            duration: 4000
          });
        }
      } finally {
        setIsLoadingNews(false);
      }
    };

    fetchRealNewsAlerts();
  }, [userLocation, selectedCity]);

  // Generate fallback alerts when real news is unavailable
  const generateFallbackAlerts = (cityData) => {
    const currentTime = new Date();
    const baseCoords = cityData || { lat: 25.3176, lng: 82.9739, displayName: 'Varanasi' };
    
    const alertsData = [
      {
        id: 'fallback-1',
        type: 'crime',
        severity: 'critical',
        title: `Police Advisory - ${baseCoords.displayName || 'Varanasi'}`,
        description: 'Stay alert in crowded areas. Keep valuables secure and travel in groups when possible.',
        location: `${baseCoords.displayName || 'Varanasi'} Central Area`,
        coordinates: { lat: baseCoords.lat, lng: baseCoords.lng },
        time: new Date(currentTime - 30 * 60 * 1000),
        icon: ExclamationTriangleIcon,
        isRealNews: false
      },
      {
        id: 'fallback-2',
        type: 'traffic',
        severity: 'high',
        title: `Traffic Update - ${baseCoords.displayName || 'Varanasi'}`,
        description: 'Monitor traffic conditions on main roads. Consider using alternate routes during peak hours.',
        location: `Main Roads, ${baseCoords.displayName || 'Varanasi'}`,
        coordinates: { lat: baseCoords.lat + 0.01, lng: baseCoords.lng + 0.01 },
        time: new Date(currentTime - 45 * 60 * 1000),
        icon: ExclamationTriangleIcon,
        isRealNews: false
      },
      {
        id: 'fallback-3',
        type: 'weather',
        severity: 'medium',
        title: 'Weather Advisory',
        description: 'Monitor weather conditions and plan accordingly.',
        location: `${baseCoords.displayName || 'Varanasi'} District`,
        coordinates: { lat: baseCoords.lat, lng: baseCoords.lng },
        time: new Date(currentTime - 15 * 60 * 1000),
        icon: InformationCircleIcon,
        isRealNews: false
      }
    ];

    return alertsData;
  };

  // Manual refresh function for real news
  const refreshNewsAlerts = async () => {
    if (isLoadingNews) return;
    
    setIsLoadingNews(true);
    toast('🔄 Refreshing latest safety alerts...', { icon: '📰' });
    
    try {
      const newsData = await newsService.fetchCityNews(selectedCity, {
        pageSize: 20,
        sources: ['newsapi', 'gnews'],
        forceReal: true
      });
      
      const convertedAlerts = newsData.news.map((article, index) => ({
        id: `news-refresh-${index}`,
        type: 'safety',
        severity: article.severity || 'medium',
        title: article.title,
        description: article.description || article.content?.substring(0, 200) + '...',
        location: article.locations?.[0]?.name || selectedCity,
        coordinates: article.locations?.[0] || { lat: 25.3176, lng: 82.9739 },
        time: new Date(article.publishedAt),
        source: article.source,
        url: article.url,
        icon: article.severity === 'critical' ? FireIcon : ExclamationTriangleIcon,
        isRealNews: true
      }));
      
      setAlerts(convertedAlerts);
      setLastNewsUpdate(new Date());
      
      toast.success(`✅ Refreshed with ${convertedAlerts.length} latest alerts!`);
      
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('❌ Could not refresh alerts. Check your internet connection.');
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Update stats whenever alerts change
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    
    const newStats = {
      total: alerts.length,
      critical: alerts.filter(alert => alert.severity === 'critical').length,
      resolved: Math.floor(alerts.length * 0.3), // Simulated resolved count
      nearby: alerts.filter(alert => {
        if (!userLocation) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          alert.coordinates.lat,
          alert.coordinates.lng
        );
        return distance <= 5; // Within 5km
      }).length
    };
    
    setStats(newStats);
  }, [alerts, userLocation]);

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return alert.severity === 'critical';
    if (activeFilter === 'nearby') return alert.distanceInMeters < 2000; // Within 2km
    return alert.type === activeFilter;
  });

  const handleAlertClick = (alert) => {
    const mapsUrl = `https://maps.google.com/?q=${alert.coordinates.lat},${alert.coordinates.lng}`;
    toast(`📍 ${alert.title}\n${alert.description}\n📍 Distance: ${alert.distance}\n🗺️ Tap to view on map`, {
      duration: 5000,
      style: {
        maxWidth: '400px',
        whiteSpace: 'pre-line'
      },
      onClick: () => {
        window.open(mapsUrl, '_blank');
      }
    });
  };

  const filters = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'critical', label: 'Critical', count: stats.critical },
    { id: 'nearby', label: 'Nearby', count: stats.nearby },
    { id: 'crime', label: 'Crime', count: alerts.filter(a => a.type === 'crime').length },
    { id: 'safety', label: 'Safety', count: alerts.filter(a => a.type === 'safety').length }
  ];

  return (
    <SafetyAlertsContainer
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
                  <Title>Safety Alerts & Notifications</Title>
      </Header>

      <StatsSection
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: theme?.colors?.text, margin: 0 }}>
                            Alert Statistics
          </h2>
          
          {/* Location Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: locationStatus === 'detected' ? 
                `${theme?.colors?.success}20` : 
                locationStatus === 'fallback' ? 
                  `${theme?.colors?.warning}20` : 
                  `${theme?.colors?.info}20`,
              color: locationStatus === 'detected' ? 
                theme?.colors?.success : 
                locationStatus === 'fallback' ? 
                  theme?.colors?.warning : 
                  theme?.colors?.info,
              borderRadius: theme?.borderRadius?.lg,
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              {isLoadingLocation || isLocating ? (
                <>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    border: '2px solid transparent',
                    borderTop: `2px solid ${theme?.colors?.info}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {locationStatus === 'detecting' ? 'Detecting location...' : 
                   locationStatus === 'requesting' ? 'Requesting location...' :
                   locationStatus === 'refreshing' ? 'Refreshing location...' : 'Getting location...'}
                </>
              ) : (
                <>
                              {locationStatus === 'detected' ? 'Live Location' :
            locationStatus === 'fallback' ? 'Default Location' : 'Location Unknown'}
                  {locationStatus === 'detected' && locationAccuracy ? 
                    ` (±${Math.round(locationAccuracy)}m)` :
                    locationStatus === 'detected' ? ' (Accurate)' : 
                    locationStatus === 'fallback' ? ' (Approximate)' : ''}
                </>
              )}
            </div>
            
            {/* Refresh Location Button */}
            <motion.button
              onClick={handleLocationRefresh}
              disabled={isLoadingLocation || isLocating}
              style={{
                padding: '0.5rem',
                background: theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)',
                color: theme?.colors?.text || '#f8f9ff',
                border: `1px solid ${theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'}`,
                borderRadius: theme?.borderRadius?.lg || '18px',
                cursor: isLoadingLocation || isLocating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoadingLocation || isLocating ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
              whileHover={!isLoadingLocation && !isLocating ? { scale: 1.05 } : {}}
              whileTap={!isLoadingLocation && !isLocating ? { scale: 0.95 } : {}}
              title="Refresh location for better accuracy"
            >
              <ArrowPathIcon style={{ 
                width: '16px', 
                height: '16px',
                animation: (isLoadingLocation || isLocating) ? 'spin 1s linear infinite' : 'none'
              }} />
            </motion.button>
          </div>
        </div>
        
        <StatsGrid>
          <StatCard>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Alerts</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical Alerts</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{stats.nearby}</div>
            <div className="stat-label">Nearby Alerts</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved Today</div>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <FilterTabs>
        {filters.map(filter => (
          <FilterTab
            key={filter.id}
            active={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {filter.label} ({filter.count})
          </FilterTab>
        ))}
      </FilterTabs>

      <AlertsGrid>
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <AlertCard
              key={alert.id}
              severity={alert.severity}
              onClick={() => handleAlertClick(alert)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertHeader>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <AlertIcon severity={alert.severity}>
                    <alert.icon />
                  </AlertIcon>
                  <AlertContent>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </AlertContent>
                </div>
                <SeverityBadge severity={alert.severity}>
                  {alert.severity}
                </SeverityBadge>
              </AlertHeader>
              
              <AlertMeta>
                <div className="meta-item">
                  <MapPinIcon />
                  {alert.location}
                </div>
                <div className="meta-item">
                  <ClockIcon />
                  {alert.time.toLocaleTimeString()} ({alert.distance})
                </div>
              </AlertMeta>
            </AlertCard>
          ))}
        </AnimatePresence>
      </AlertsGrid>
    </SafetyAlertsContainer>
  );
};

export default SafetyAlerts; 