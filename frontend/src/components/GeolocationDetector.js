import React, { useState, useEffect } from 'react';
import { FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import newsService from '../services/newsService';

const GeolocationDetector = ({ onLocationDetected, onCityDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestCity, setNearestCity] = useState(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearest supported city
  const findNearestCity = (userLat, userLng) => {
    const cities = newsService.getSupportedCities();
    
    let nearestCity = null;
    let minDistance = Infinity;
    
    cities.forEach(city => {
      const distance = calculateDistance(userLat, userLng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = { ...city, distance };
      }
    });
    
    return nearestCity;
  };

  // Get user's current location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const location = {
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy
        };
        
        setCurrentLocation(location);
        
        // Find nearest supported city
        const nearest = findNearestCity(latitude, longitude);
        setNearestCity(nearest);
        
        // Notify parent components
        if (onLocationDetected) {
          onLocationDetected(location);
        }
        
        if (onCityDetected && nearest) {
          onCityDetected(nearest);
        }
        
        setIsDetecting(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Unknown error occurred';
            break;
        }
        
        setError(errorMessage);
        setIsDetecting(false);
      },
      options
    );
  };

  // Auto-detect on component mount
  useEffect(() => {
    // Auto-detect location when component loads
    detectLocation();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <FiMapPin className="w-4 h-4 mr-2 text-teal-600" />
          Location Detection
        </h3>
        
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDetecting ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiMapPin className="w-4 h-4" />
          )}
        </button>
      </div>

      {isDetecting && (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiLoader className="w-4 h-4 mr-2 animate-spin" />
          Detecting your location...
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600 mb-2">
          <FiAlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {currentLocation && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Your Location:</span>
            <span className="font-medium text-gray-900">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          </div>
          
          {nearestCity && (
            <div className="p-2 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-teal-800">Nearest City:</span>
                <span className="text-teal-600">{nearestCity.displayName}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-teal-600 mt-1">
                <span>{nearestCity.state}</span>
                <span>{nearestCity.distance.toFixed(1)} km away</span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Accuracy: ±{Math.round(currentLocation.accuracy)}m
          </div>
        </div>
      )}

      {!currentLocation && !isDetecting && !error && (
        <div className="text-sm text-gray-500 text-center py-2">
          Click the location icon to detect your position
        </div>
      )}
    </div>
  );
};

export default GeolocationDetector; 