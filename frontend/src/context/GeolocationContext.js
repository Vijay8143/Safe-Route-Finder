import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Geolocation context
const GeolocationContext = createContext();

// Default location (Varanasi, India - more relevant for this app)
const DEFAULT_LOCATION = {
  lat: 25.3176,
  lng: 82.9739,
  accuracy: null,
  timestamp: Date.now(),
};

export const GeolocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Geofencing
  const [safeZones, setSafeZones] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [currentZone, setCurrentZone] = useState(null);

  // Enhanced location options for better accuracy
  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // Increased timeout for better accuracy
    maximumAge: 30000, // Shorter maximum age for fresher location
  };

  // High accuracy location options for critical operations
  const highAccuracyOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10000, // Very fresh location required
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  }, []);

  // Check if location is within a zone
  const isInZone = useCallback((location, zone) => {
    const distance = calculateDistance(
      location.lat, location.lng,
      zone.center.lat, zone.center.lng
    );
    return distance <= zone.radius;
  }, [calculateDistance]);

  // Check geofencing
  const checkGeofencing = useCallback((location) => {
    // Check safe zones
    const currentSafeZone = safeZones.find(zone => isInZone(location, zone));
    
    // Check danger zones
    const currentDangerZone = dangerZones.find(zone => isInZone(location, zone));
    
    let newZone = null;
    
    if (currentDangerZone) {
      newZone = { ...currentDangerZone, type: 'danger' };
      if (!currentZone || currentZone.id !== currentDangerZone.id) {
        toast.error(`⚠️ You've entered a danger zone: ${currentDangerZone.name}`);
      }
    } else if (currentSafeZone) {
      newZone = { ...currentSafeZone, type: 'safe' };
      if (!currentZone || currentZone.id !== currentSafeZone.id) {
        toast.success(`✅ You're in a safe zone: ${currentSafeZone.name}`);
      }
    }
    
    setCurrentZone(newZone);
  }, [safeZones, dangerZones, currentZone, isInZone]);

  // Handle location update
  const handleLocationUpdate = useCallback((position) => {
    const newLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || 0,
      heading: position.coords.heading,
      timestamp: position.timestamp,
    };

    // Prevent unnecessary updates if location hasn't changed significantly
    const distanceFromCurrent = currentLocation ? calculateDistance(
      currentLocation.lat, currentLocation.lng,
      newLocation.lat, newLocation.lng
    ) : 999999;

    // Only update if location has changed significantly (more than 5 meters) or if it's the first real location
    const isSignificantChange = distanceFromCurrent > 5;
    const isFirstRealLocation = (currentLocation.lat === 25.3176 && currentLocation.lng === 82.9739);
    
    if (isSignificantChange || isFirstRealLocation) {
      console.log('📍 Updating location:', newLocation, `Distance change: ${Math.round(distanceFromCurrent)}m`);
      
      setCurrentLocation(newLocation);
      setSpeed(position.coords.speed || 0);
      setHeading(position.coords.heading);
      setLocationAccuracy(position.coords.accuracy);
      setLocationError(null);
      setIsLocating(false);

      // Provide accuracy feedback
      if (position.coords.accuracy) {
        if (position.coords.accuracy <= 10) {
          console.log('📍 High accuracy location obtained:', position.coords.accuracy + 'm');
        } else if (position.coords.accuracy <= 50) {
          console.log('📍 Good accuracy location obtained:', position.coords.accuracy + 'm');
        } else {
          console.log('📍 Low accuracy location obtained:', position.coords.accuracy + 'm');
        }
      }

      // Add to history (limit to last 100 locations)
      setLocationHistory(prev => {
        const updated = [...prev, newLocation];
        return updated.slice(-100);
      });

      // Check geofencing
      checkGeofencing(newLocation);

      // Store in localStorage for persistence
      localStorage.setItem('lastKnownLocation', JSON.stringify(newLocation));
    } else {
      console.log('📍 Location change too small, skipping update:', Math.round(distanceFromCurrent) + 'm');
      // Still update the loading state even if we skip the location update
      setIsLocating(false);
    }
  }, [checkGeofencing, currentLocation, calculateDistance]);

  // Handle location error
  const handleLocationError = useCallback((error) => {
    setIsLocating(false);
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
        setIsLocationEnabled(false);
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please check your GPS signal.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Trying again...';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting location';
        break;
    }
    
    setLocationError(errorMessage);
    console.error('Geolocation error:', errorMessage);
    
    // Don't show toast for timeout errors to avoid spam
    if (error.code !== error.TIMEOUT) {
      toast.error(`📍 ${errorMessage}`);
    }
  }, []);

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setLocationError(error);
      toast.error(error);
      return;
    }

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    setIsLocating(true);
    const id = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      locationOptions
    );

    setWatchId(id);
    setIsTracking(true);
    setIsLocationEnabled(true);
    
    toast.success('📍 Location tracking started');
  }, [handleLocationUpdate, handleLocationError, watchId]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    setIsLocating(false);
    toast.success('📍 Location tracking stopped');
  }, [watchId]);

  // Get current location once with enhanced accuracy
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsLocating(true);
      
      // First try with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationUpdate(position);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // If accuracy is good enough, resolve immediately
          if (!position.coords.accuracy || position.coords.accuracy <= 50) {
            resolve(location);
            return;
          }
          
          // If accuracy is poor, try again with different options
          setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
              (betterPosition) => {
                handleLocationUpdate(betterPosition);
                resolve({
                  lat: betterPosition.coords.latitude,
                  lng: betterPosition.coords.longitude,
                  accuracy: betterPosition.coords.accuracy
                });
              },
              () => {
                // If second attempt fails, use the first result
                resolve(location);
              },
              highAccuracyOptions
            );
          }, 1000);
        },
        (error) => {
          handleLocationError(error);
          reject(error);
        },
        locationOptions
      );
    });
  }, [handleLocationUpdate, handleLocationError]);

  // Force location refresh with maximum accuracy
  const refreshLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsLocating(true);
      toast.loading('📍 Getting your precise location...', { duration: 3000 });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationUpdate(position);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          toast.success(`📍 Location updated! Accuracy: ${Math.round(position.coords.accuracy || 0)}m`);
          resolve(location);
        },
        (error) => {
          handleLocationError(error);
          reject(error);
        },
        highAccuracyOptions
      );
    });
  }, [handleLocationUpdate, handleLocationError]);

  // Add safe zone
  const addSafeZone = useCallback((zone) => {
    const newZone = {
      id: Date.now().toString(),
      ...zone,
      createdAt: new Date().toISOString(),
    };
    setSafeZones(prev => [...prev, newZone]);
    return newZone;
  }, []);

  // Add danger zone
  const addDangerZone = useCallback((zone) => {
    const newZone = {
      id: Date.now().toString(),
      ...zone,
      createdAt: new Date().toISOString(),
    };
    setDangerZones(prev => [...prev, newZone]);
    return newZone;
  }, []);

  // Remove zone
  const removeZone = useCallback((zoneId, type) => {
    if (type === 'safe') {
      setSafeZones(prev => prev.filter(zone => zone.id !== zoneId));
    } else {
      setDangerZones(prev => prev.filter(zone => zone.id !== zoneId));
    }
  }, []);

  // Initialize location from localStorage and auto-start if needed
  useEffect(() => {
    const initializeLocation = async () => {
      // Check for saved location first
      const savedLocation = localStorage.getItem('lastKnownLocation');
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          // Only use saved location if it's not the default Varanasi coordinates
          // This means it's a real GPS location that was previously detected
          if (parsedLocation.lat !== 25.3176 || parsedLocation.lng !== 82.9739) {
            console.log('📍 Using saved real location:', parsedLocation);
            setCurrentLocation(parsedLocation);
            setLocationAccuracy(parsedLocation.accuracy);
          } else {
            console.log('📍 Saved location is default coordinates, will get fresh location');
          }
        } catch (error) {
          console.error('Error parsing saved location:', error);
        }
      }

      // Auto-start tracking if user has previously enabled it
      const autoTrack = localStorage.getItem('autoTrackLocation');
      if (autoTrack === 'true') {
        console.log('📍 Auto-starting location tracking...');
        startTracking();
      } else {
        // Try to get current location once if no auto-tracking
        try {
          console.log('📍 Getting initial location...');
          await getCurrentLocation();
        } catch (error) {
          console.log('📍 Could not get initial location, using default');
        }
      }
    };

    initializeLocation();
  }, []); // Empty dependency array to run only once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Save auto-tracking preference
  useEffect(() => {
    localStorage.setItem('autoTrackLocation', isTracking.toString());
  }, [isTracking]);

  const value = {
    // Location data
    currentLocation,
    locationHistory,
    speed,
    heading,
    locationAccuracy,
    
    // Tracking state
    isTracking,
    isLocationEnabled,
    isLocating,
    locationError,
    
    // Geofencing
    safeZones,
    dangerZones,
    currentZone,
    
    // Actions
    startTracking,
    stopTracking,
    getCurrentLocation,
    refreshLocation,
    addSafeZone,
    addDangerZone,
    removeZone,
    calculateDistance,
    
    // Utils
    isInZone,
  };

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
};

// Custom hook to use geolocation
export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};

export default GeolocationContext; 