import axios from 'axios';

class GlobalLocationService {
  constructor() {
    this.geocodingProviders = [
      'nominatim', // OpenStreetMap (free)
      'mapbox',    // Mapbox (requires API key)
      'google'     // Google (requires API key)
    ];
    
    this.countryData = {
      emergencyNumbers: {
        'US': '911',
        'GB': '999',
        'DE': '112',
        'FR': '112',
        'IT': '112',
        'ES': '112',
        'IN': '112',
        'AU': '000',
        'CA': '911',
        'JP': '110',
        'CN': '110',
        'BR': '190',
        'MX': '911',
        'RU': '112'
      },
      safetyRatings: {
        'Singapore': 9.5,
        'Japan': 9.2,
        'Switzerland': 9.0,
        'Norway': 8.9,
        'Denmark': 8.8,
        'Netherlands': 8.7,
        'Finland': 8.6,
        'Austria': 8.5,
        'Canada': 8.4,
        'Australia': 8.3,
        'Sweden': 8.2,
        'Germany': 8.1,
        'New Zealand': 8.0,
        'Belgium': 7.9,
        'United Kingdom': 7.8,
        'France': 7.5,
        'United States': 7.3,
        'Italy': 7.0,
        'Spain': 6.8
      }
    };
  }

  // Get current location with high accuracy
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };

          // Get detailed location info
          try {
            const locationInfo = await this.reverseGeocode(location.lat, location.lng);
            location.address = locationInfo.address;
            location.country = locationInfo.country;
            location.city = locationInfo.city;
            location.emergencyNumber = this.getEmergencyNumber(locationInfo.countryCode);
            location.safetyRating = this.getCountrySafetyRating(locationInfo.country);
          } catch (error) {
            console.warn('Could not get detailed location info:', error);
          }

          resolve(location);
        },
        (error) => {
          let errorMessage = 'Location access denied';
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
          }
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  // Watch position for live tracking
  watchPosition(successCallback, errorCallback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000, // 10 seconds for live tracking
      ...options
    };

    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // Add location context for live tracking
        try {
          const timeOfDay = this.getTimeOfDay();
          const localTime = new Date().toLocaleString();
          location.timeOfDay = timeOfDay;
          location.localTime = localTime;
          location.isDangerous = timeOfDay === 'night';
        } catch (error) {
          console.warn('Error adding location context:', error);
        }

        successCallback(location);
      },
      errorCallback,
      defaultOptions
    );
  }

  // Reverse geocoding with multiple providers
  async reverseGeocode(lat, lng) {
    for (const provider of this.geocodingProviders) {
      try {
        const result = await this.reverseGeocodeWithProvider(lat, lng, provider);
        if (result) return result;
      } catch (error) {
        console.warn(`Reverse geocoding failed with ${provider}:`, error);
      }
    }
    
    throw new Error('All reverse geocoding providers failed');
  }

  // Reverse geocode with specific provider
  async reverseGeocodeWithProvider(lat, lng, provider) {
    switch (provider) {
      case 'nominatim':
        return await this.reverseGeocodeNominatim(lat, lng);
      case 'mapbox':
        return await this.reverseGeocodeMapbox(lat, lng);
      case 'google':
        return await this.reverseGeocodeGoogle(lat, lng);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // OpenStreetMap Nominatim (free)
  async reverseGeocodeNominatim(lat, lng) {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'SafeRouteNavigator/1.0'
        }
      }
    );

    const data = response.data;
    const address = data.address || {};
    
    return {
      formatted: data.display_name,
      address: {
        house_number: address.house_number,
        road: address.road,
        suburb: address.suburb || address.neighbourhood,
        city: address.city || address.town || address.village,
        state: address.state,
        country: address.country,
        postcode: address.postcode
      },
      country: address.country,
      countryCode: address.country_code?.toUpperCase(),
      city: address.city || address.town || address.village,
      type: data.type,
      importance: data.importance,
      placeId: data.place_id,
      provider: 'nominatim'
    };
  }

  // Forward geocoding (address to coordinates)
  async geocode(address) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'SafeRouteNavigator/1.0'
          }
        }
      );

      return response.data.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted: result.display_name,
        importance: result.importance,
        type: result.type,
        address: result.address
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  // Get places of interest around a location
  async getNearbyPlaces(lat, lng, type = 'amenity', radius = 1000) {
    try {
      // Using Overpass API for POI data
      const query = `
        [out:json][timeout:25];
        (
          node["${type}"](around:${radius},${lat},${lng});
          way["${type}"](around:${radius},${lat},${lng});
          relation["${type}"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;

      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );

      return response.data.elements.map(element => ({
        id: element.id,
        type: element.type,
        lat: element.lat || element.center?.lat,
        lng: element.lon || element.center?.lon,
        tags: element.tags,
        name: element.tags?.name,
        amenity: element.tags?.amenity,
        distance: this.calculateDistance(lat, lng, element.lat || element.center?.lat, element.lon || element.center?.lon)
      })).filter(place => place.lat && place.lng);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  // Get safe places nearby (hospitals, police stations, etc.)
  async getSafePlacesNearby(lat, lng, radius = 2000) {
    const safePlaceTypes = [
      { type: 'amenity=hospital', category: 'medical' },
      { type: 'amenity=police', category: 'safety' },
      { type: 'amenity=fire_station', category: 'safety' },
      { type: 'amenity=bank', category: 'secure' },
      { type: 'shop=mall', category: 'public' },
      { type: 'amenity=library', category: 'public' },
      { type: 'amenity=school', category: 'public' },
      { type: 'amenity=university', category: 'public' }
    ];

    const allPlaces = [];
    
    for (const placeType of safePlaceTypes) {
      try {
        const places = await this.getNearbyPlaces(lat, lng, placeType.type.split('=')[0], radius);
        const filteredPlaces = places
          .filter(place => place.tags[placeType.type.split('=')[0]] === placeType.type.split('=')[1])
          .map(place => ({
            ...place,
            category: placeType.category,
            safetyScore: this.getSafetyScoreForPlace(placeType.category)
          }));
        allPlaces.push(...filteredPlaces);
      } catch (error) {
        console.warn(`Error fetching ${placeType.type}:`, error);
      }
    }

    return allPlaces
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // Limit to 20 closest places
  }

  // Get safety score for different place types
  getSafetyScoreForPlace(category) {
    const safetyScores = {
      'safety': 10,    // Police, fire stations
      'medical': 9,    // Hospitals
      'secure': 8,     // Banks
      'public': 7      // Schools, libraries, malls
    };
    return safetyScores[category] || 5;
  }

  // Get emergency number for country
  getEmergencyNumber(countryCode) {
    return this.countryData.emergencyNumbers[countryCode] || '112'; // EU default
  }

  // Get country safety rating
  getCountrySafetyRating(country) {
    return this.countryData.safetyRatings[country] || 5.0; // Default neutral rating
  }

  // Get time of day
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Check if location is in safe area
  async isLocationSafe(lat, lng) {
    try {
      const locationInfo = await this.reverseGeocode(lat, lng);
      const countrySafety = this.getCountrySafetyRating(locationInfo.country);
      const timeOfDay = this.getTimeOfDay();
      const safePlaces = await this.getSafePlacesNearby(lat, lng, 500);
      
      let safetyScore = countrySafety;
      
      // Adjust for time of day
      if (timeOfDay === 'night') safetyScore -= 2;
      else if (timeOfDay === 'evening') safetyScore -= 1;
      
      // Adjust for nearby safe places
      if (safePlaces.length > 3) safetyScore += 1;
      else if (safePlaces.length === 0) safetyScore -= 1;
      
      return {
        isSafe: safetyScore >= 7,
        safetyScore: Math.max(0, Math.min(10, safetyScore)),
        factors: {
          countrySafety,
          timeOfDay,
          safePlacesNearby: safePlaces.length
        },
        recommendations: this.getSafetyRecommendations(safetyScore, timeOfDay),
        nearestSafePlaces: safePlaces.slice(0, 3)
      };
    } catch (error) {
      console.error('Error checking location safety:', error);
      return {
        isSafe: false,
        safetyScore: 5,
        factors: { error: error.message },
        recommendations: ['Unable to assess safety - stay alert'],
        nearestSafePlaces: []
      };
    }
  }

  // Get safety recommendations
  getSafetyRecommendations(safetyScore, timeOfDay) {
    const recommendations = [];
    
    if (safetyScore < 5) {
      recommendations.push('⚠️ High risk area - avoid if possible');
      recommendations.push('🚨 Share location with emergency contact');
      recommendations.push('📱 Keep emergency numbers ready');
    } else if (safetyScore < 7) {
      recommendations.push('⚡ Moderate risk - stay alert');
      recommendations.push('👥 Travel with others when possible');
    } else {
      recommendations.push('✅ Generally safe area');
    }
    
    if (timeOfDay === 'night') {
      recommendations.push('🌙 Extra caution at night');
      recommendations.push('💡 Stay in well-lit areas');
      recommendations.push('🚗 Consider transportation options');
    }
    
    return recommendations;
  }

  // Format location for display
  formatLocation(locationInfo) {
    if (!locationInfo.address) return locationInfo.formatted || 'Unknown location';
    
    const parts = [];
    if (locationInfo.address.road) parts.push(locationInfo.address.road);
    if (locationInfo.address.suburb) parts.push(locationInfo.address.suburb);
    if (locationInfo.address.city) parts.push(locationInfo.address.city);
    if (locationInfo.address.country) parts.push(locationInfo.address.country);
    
    return parts.join(', ') || locationInfo.formatted || 'Unknown location';
  }
}

export default new GlobalLocationService(); 