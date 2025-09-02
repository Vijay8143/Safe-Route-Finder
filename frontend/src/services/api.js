import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Crime data services
export const crimeService = {
  getCrimeData: (lat, lng, radius = 0.01) => 
    api.get(`/api/crime-data?lat=${lat}&lng=${lng}&radius=${radius}`),
  
  reportCrime: (crimeData) => 
    api.post('/api/report', crimeData),
  
  getCrimeStats: (lat, lng, radius = 0.01) => 
    api.get(`/api/stats?lat=${lat}&lng=${lng}&radius=${radius}`)
};

// Rating services
export const ratingService = {
  rateRoute: (ratingData) => 
    api.post('/api/ratings/rate-route', ratingData),
  
  getSafetyHeatmap: (lat, lng, radius = 0.02) => 
    api.get(`/api/ratings/heatmap?lat=${lat}&lng=${lng}&radius=${radius}`),
  
  getLocationRatings: (lat, lng, radius = 0.005) => 
    api.get(`/api/ratings/location?lat=${lat}&lng=${lng}&radius=${radius}`)
};

// SOS services
export const sosService = {
  sendSOSAlert: (sosData) => 
    api.post('/api/sos/alert', sosData),
  
  shareLocation: (locationData) => 
    api.post('/api/sos/share-location', locationData),
  
  getLiveLocation: (shareId) => 
    api.get(`/api/sos/live-location/${shareId}`),
  
  updateLiveLocation: (shareId, locationData) => 
    api.put(`/api/sos/live-location/${shareId}`, locationData)
};

// Geolocation utilities
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Create a timeout to handle cases where getCurrentPosition never calls back
    const timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, 15000); // 15 seconds timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        console.log('Location obtained:', position.coords);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0)
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Geolocation error:', error);
        
        // Create enhanced error with better messaging
        const enhancedError = new Error();
        enhancedError.code = error.code;
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            enhancedError.message = 'Location access denied by user';
            break;
          case 2: // POSITION_UNAVAILABLE
            enhancedError.message = 'Location information unavailable';
            break;
          case 3: // TIMEOUT
            enhancedError.message = 'Location request timed out';
            break;
          default:
            enhancedError.message = 'Unknown location error';
        }
        
        reject(enhancedError);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000, // 12 seconds for the API call
        maximumAge: 60000 // 1 minute - allow cached location
      }
    );
  });
};

// Night mode detection
export const isNightMode = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20; // Night time: 8 PM to 6 AM
};

// Distance calculation (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance * 1000; // Return distance in meters
};

// Format distance in user-friendly way
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 10) {
    return 'Very close';
  } else if (distanceInMeters < 100) {
    return `${Math.round(distanceInMeters)}m`;
  } else if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters / 10) * 10}m`;
  } else if (distanceInMeters < 10000) {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(distanceInMeters / 1000)}km`;
  }
};

// Get distance with direction indicator
export const getDistanceWithDirection = (userLat, userLng, targetLat, targetLng) => {
  const distance = calculateDistance(userLat, userLng, targetLat, targetLng);
  const bearing = getBearing(userLat, userLng, targetLat, targetLng);
  const direction = getDirectionFromBearing(bearing);
  
  return {
    distance: distance,
    formattedDistance: formatDistance(distance),
    direction: direction,
    bearing: bearing
  };
};

// Calculate bearing between two points
const getBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360 degrees
};

// Convert bearing to direction
const getDirectionFromBearing = (bearing) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}; 