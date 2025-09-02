import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { 
  FiMenu, 
  FiLogOut, 
  FiAlertTriangle, 
  FiNavigation, 
  FiStar,
  FiMoon,
  FiSun,
  FiShield,
  FiPhone,
  FiShare2,
  FiSettings,
  FiUser,
  FiX,
  FiTarget,
  FiMapPin
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getCurrentPosition, isNightMode } from '../services/api';
import toast from 'react-hot-toast';

// Map Components
import CrimeMarkers from '../components/Map/CrimeMarkers';
import SafetyHeatmap from '../components/Map/SafetyHeatmap';
import RouteControl from '../components/Map/RouteControl';
import SOSButton from '../components/SOS/SOSButton';
import RouteRatingForm from '../components/Rating/RouteRatingForm';
import CrimeReportForm from '../components/Crime/CrimeReportForm';
import LoadingSpinner from '../components/LoadingSpinner';

// Enhanced Components 
import CitySelector from '../components/CitySelector';
import GeolocationDetector from '../components/GeolocationDetector';
import WeatherWidget from '../components/WeatherWidget';
import RouteDisplay from '../components/RouteDisplay';

// Enhanced Services
import smartRouteService from '../services/smartRouteService';

// Map center (New York City)
const DEFAULT_CENTER = [40.7589, -73.9851];
const DEFAULT_ZOOM = 14;

// Custom hook for map click handler
const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };
    
    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onMapClick]);
  
  return null;
};

const MapPage = () => {
  const { user, logout } = useAuth();
  const mapRef = useRef(null);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeActive, setRouteActive] = useState(false);
  const [waitingForDestination, setWaitingForDestination] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  
  // Enhanced features state
  const [selectedCity, setSelectedCity] = useState('varanasi');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSafetyAnalysis, setRouteSafetyAnalysis] = useState(null);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        // Show immediate prompt for location
        toast('📍 Please allow location access for best experience', {
          icon: '🗺️',
          duration: 8000
        });

        // Get user's current location immediately
        const position = await getCurrentPosition();
        setCurrentLocation(position);
        setMapCenter([position.lat, position.lng]);
        setMapZoom(16); // Zoom closer to user location
        
        toast.success(`✅ Your location found! Welcome to Safe Route Navigator`, {
          icon: '🎯',
          duration: 3000
        });

        // Check if it's night mode
        const isNight = isNightMode();
        setNightMode(isNight);

        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        
        // Show persistent prompt for location access
        if (error.code === 1) {
          toast.error('❌ Location access denied. Please enable location in browser settings and refresh page.', { 
            duration: 10000 
          });
          
          // Show React modal instead of confirm()
          setShowLocationPrompt(true);
        } else {
          toast.error('⚠️ Could not get location. Using default view.', { duration: 5000 });
        }
        
        // Use default location but still notify user
        setCurrentLocation({
          lat: DEFAULT_CENTER[0],
          lng: DEFAULT_CENTER[1],
          accuracy: 0
        });
        
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const centerMapOnUser = async () => {
    try {
      const position = await getCurrentPosition();
      setCurrentLocation(position);
      setMapCenter([position.lat, position.lng]);
      toast.success('Location updated');
    } catch (error) {
      toast.error('Could not get your location');
    }
  };

  const handleGetRoute = () => {
    if (routeActive) {
      // Stop current route
      clearRoute();
      toast('Route stopped', { icon: '🛑' });
    } else if (currentLocation) {
      // Use current location as start point
      setStartPoint({ lat: currentLocation.lat, lng: currentLocation.lng });
      setWaitingForDestination(true);
      toast('Click on the map to set your destination', {
        duration: 4000,
        icon: '📍'
      });
    } else {
      // Manual route planning
      toast('Click on the map to set start and end points', {
        duration: 4000,
        icon: '📍'
      });
    }
  };

  const clearRoute = () => {
    setRouteActive(false);
    setDestination(null);
    setCurrentRoute(null);
    setCurrentInstruction(null);
    setWaitingForDestination(false);
    setStartPoint(null);
    setEndPoint(null);
    setRouteInfo(null);
    setRouteSafetyAnalysis(null);
    setIsAnalyzingSafety(false);
  };

  // Analyze route safety when route is established
  useEffect(() => {
    if (startPoint && endPoint && selectedCity) {
      analyzeRouteSafety();
    }
  }, [startPoint, endPoint, selectedCity]);

  const analyzeRouteSafety = async () => {
    setIsAnalyzingSafety(true);
    try {
      // Create a mock route object for analysis
      const mockRoute = {
        coordinates: [startPoint, endPoint],
        summary: {
          totalDistance: calculateDistance(startPoint, endPoint) * 1000 // Convert to meters
        }
      };

      console.log(`🛡️ Analyzing safety for route in ${selectedCity}...`);
      const safetyAnalysis = await smartRouteService.calculateRouteSafety(mockRoute, selectedCity);
      
      setRouteSafetyAnalysis(safetyAnalysis);
      console.log('Safety analysis result:', safetyAnalysis);

      // Show safety notification
      if (safetyAnalysis.safetyScore >= 4) {
        toast.success(`Route looks safe! Safety score: ${safetyAnalysis.safetyScore}/5`, {
          icon: '🛡️'
        });
      } else if (safetyAnalysis.safetyScore >= 3) {
        toast(`Moderate safety route (${safetyAnalysis.safetyScore}/5). Stay alert!`, {
          icon: '⚠️'
        });
      } else {
        toast.error(`Safety concerns detected (${safetyAnalysis.safetyScore}/5). Consider alternatives.`, {
          duration: 6000
        });
      }

    } catch (error) {
      console.error('Safety analysis failed:', error);
      toast('Unable to analyze route safety', { icon: '⚠️' });
    } finally {
      setIsAnalyzingSafety(false);
    }
  };

  // Handle city change
  const handleCityChange = (cityData) => {
    let city = cityData;
    if (typeof cityData === 'string') {
      // If it's just a city name, find the city data
      const cities = require('../services/newsService').default.getSupportedCities();
      city = cities.find(c => c.name === cityData.toLowerCase());
    }
    
    if (city && city.name && typeof city.lat === 'number' && typeof city.lng === 'number') {
      setSelectedCity(city.name);
      setMapCenter([city.lat, city.lng]);
      setMapZoom(14);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleMapClick = (latlng) => {
    if (waitingForDestination) {
      setDestination([latlng.lat, latlng.lng]);
      setEndPoint({ lat: latlng.lat, lng: latlng.lng });
      setRouteActive(true);
      setWaitingForDestination(false);
      toast.success('Destination set! Calculating safe route...', {
        icon: '🗺️'
      });
    } else {
      // Enhanced route planning - set start/end points
      if (!startPoint) {
        setStartPoint({ lat: latlng.lat, lng: latlng.lng });
        setCurrentLocation({ lat: latlng.lat, lng: latlng.lng });
        toast('Start point set! Click another location for destination', {
          icon: '📍'
        });
      } else if (!endPoint) {
        setEndPoint({ lat: latlng.lat, lng: latlng.lng });
        setDestination([latlng.lat, latlng.lng]);
        setRouteActive(true);
        toast.success('Route planning started!', {
          icon: '🗺️'
        });
      } else {
        // Reset and start new route
        setStartPoint({ lat: latlng.lat, lng: latlng.lng });
        setCurrentLocation({ lat: latlng.lat, lng: latlng.lng });
        setEndPoint(null);
        setDestination(null);
        setRouteActive(false);
        toast('New start point set! Click for destination', {
          icon: '🔄'
        });
      }
    }
  };

  const handleRouteFound = (route) => {
    setCurrentRoute(route);
    const safetyScore = route.safety?.score || 3;
    
    // Set first instruction for navigation
    if (route.instructions && route.instructions.length > 0) {
      setCurrentInstruction({
        text: route.instructions[0].text || "Start your journey",
        distance: route.instructions[0].distance || 0,
        type: route.instructions[0].type || "Head",
        index: 0
      });
    }
    
    if (safetyScore >= 4) {
      toast.success(`Safe route found! Safety score: ${safetyScore}/5`, {
        icon: '✅'
      });
    } else if (safetyScore >= 3) {
      toast('Route found with moderate safety. Stay alert!', {
        icon: '⚠️',
        duration: 4000
      });
    } else {
      toast.error(`Route found but may not be safe. Safety: ${safetyScore}/5`, {
        duration: 5000
      });
    }
  };

  const getInstructionIcon = (type) => {
    switch(type) {
      case 'Head': return '🧭';
      case 'Left': return '⬅️';
      case 'Right': return '➡️';
      case 'SharpLeft': return '↖️';
      case 'SharpRight': return '↗️';
      case 'SlightLeft': return '↙️';
      case 'SlightRight': return '↘️';
      case 'Continue': return '⬆️';
      case 'Arrive': return '🏁';
      case 'Roundabout': return '🔄';
      default: return '📍';
    }
  };

  const togglePanel = (panel) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      setSidebarOpen(true);
    }
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'crime-report':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Crime</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <CrimeReportForm 
              currentLocation={currentLocation}
              onSuccess={() => {
                setActivePanel(null);
                toast.success('Crime reported successfully');
              }}
            />
          </div>
        );
      
      case 'route-rating':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rate Route</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <RouteRatingForm 
              currentLocation={currentLocation}
              destination={destination}
              onClose={() => setActivePanel(null)}
            />
          </div>
        );
      
      case 'profile':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              {/* Current Route Info */}
              {(currentRoute || (startPoint && endPoint)) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Current Route</h5>
                  {startPoint && endPoint && (
                    <>
                      <p className="text-sm text-blue-700">
                        Distance: {calculateDistance(startPoint, endPoint).toFixed(2)} km
                      </p>
                      <p className="text-sm text-blue-700">
                        Est. Time: {Math.round(calculateDistance(startPoint, endPoint) * 3)} min
                      </p>
                    </>
                  )}
                  <p className="text-sm text-blue-700">
                    Safety Score: {routeSafetyAnalysis?.safetyScore || (isAnalyzingSafety ? 'Analyzing...' : 'Not analyzed')}/5
                  </p>
                  {routeSafetyAnalysis?.recommendation && (
                    <p className="text-xs text-blue-600 mt-1">
                      {routeSafetyAnalysis.recommendation}
                    </p>
                  )}
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        );
        
      case 'city-selector':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select City</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <CitySelector
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              compact={true}
            />
          </div>
        );
        
      case 'location-detector':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Auto Location</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <GeolocationDetector
              onLocationDetected={(location) => {
                setCurrentLocation(location);
                setMapCenter([location.lat, location.lng]);
                setMapZoom(16);
                toast.success('Location detected!');
              }}
              onCityDetected={(city) => {
                setSelectedCity(city.name);
                setMapCenter([city.lat, city.lng]);
                toast.success(`Nearest city: ${city.name}`);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Safe Route Navigator..." />;
  }

  return (
    <div className="h-screen flex relative bg-gray-900">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Map Click Handler */}
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Crime Markers */}
          <CrimeMarkers center={mapCenter} />
          
          {/* Safety Heatmap */}
          <SafetyHeatmap center={mapCenter} />
          
          {/* Enhanced Route Control with Real Roads */}
          {startPoint && endPoint && (
            <RouteDisplay 
              startPoint={startPoint}
              endPoint={endPoint}
              onRouteCalculated={(distance, duration) => {
                setRouteInfo({ distance, duration });
                console.log(`🛣️ Route calculated: ${distance}km, ${duration}min`);
              }}
            />
          )}
          
          {/* Original Route Control for backward compatibility */}
          {routeActive && currentLocation && destination && !startPoint && (
            <RouteControl 
              start={[currentLocation.lat, currentLocation.lng]}
              end={destination}
              onRouteFound={handleRouteFound}
            />
          )}
          
          {/* Start and End Point Markers */}
          {startPoint && (
            <Marker position={startPoint}>
              <Popup>
                <div>
                  <strong>🟢 Start Point</strong><br/>
                  {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {endPoint && (
            <Marker position={endPoint}>
              <Popup>
                <div>
                  <strong>🔴 End Point</strong><br/>
                  {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          {/* Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <FiMenu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Night Mode Indicator */}
          {nightMode && (
            <div className="night-mode-badge bg-indigo-600 text-white px-3 py-2 rounded-xl shadow-lg flex items-center space-x-2">
              <FiMoon className="w-4 h-4" />
              <span className="text-sm font-medium">Night Mode</span>
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          {/* My Location */}
          <button
            onClick={centerMapOnUser}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <FiTarget className="w-5 h-5 text-gray-700" />
          </button>

          {/* City Selector Button */}
          <button
            onClick={() => togglePanel('city-selector')}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            🏙️
          </button>

          {/* Auto Location Button */}
          <button
            onClick={() => togglePanel('location-detector')}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            📍
          </button>

          {/* Enhanced Route Info */}
          {(startPoint && endPoint) && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-48 text-xs">
              <div className="flex items-center space-x-1 mb-2">
                <FiNavigation className="w-3 h-3 text-teal-600" />
                <span className="font-medium text-gray-800">Route Active</span>
              </div>
              <div className="space-y-1">
                <div className="text-gray-600">
                  📏 {calculateDistance(startPoint, endPoint).toFixed(2)} km
                </div>
                <div className="text-gray-600">
                  ⏱️ {Math.round(calculateDistance(startPoint, endPoint) * 3)} min
                </div>
                <div className={`font-bold ${
                  routeSafetyAnalysis?.safetyScore >= 4 ? 'text-green-600' :
                  routeSafetyAnalysis?.safetyScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  🛡️ Safety: {routeSafetyAnalysis?.safetyScore || (isAnalyzingSafety ? '...' : 'N/A')}/5
                </div>
              </div>
            </div>
          )}

          {/* Weather Widget */}
          {currentLocation && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
              <WeatherWidget
                latitude={currentLocation.lat}
                longitude={currentLocation.lng}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Destination Indicator */}
        {waitingForDestination && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <FiMapPin className="w-5 h-5" />
              <span>Click on map to set destination</span>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] flex space-x-3">
          {/* Quick Action Buttons */}
          <button
            onClick={() => togglePanel('crime-report')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <FiAlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Report Crime</span>
          </button>
          
          <button
            onClick={() => togglePanel('route-rating')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            <FiStar className="w-4 h-4" />
            <span className="hidden sm:inline">Rate Route</span>
          </button>
          
          <button
            onClick={handleGetRoute}
            className={`${
              (routeActive || (startPoint && endPoint))
                ? 'bg-red-600 hover:bg-red-700' 
                : waitingForDestination 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-teal-600 hover:bg-teal-700'
            } text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2`}
          >
            <FiNavigation className="w-4 h-4" />
            <span className="hidden sm:inline">
              {(routeActive || (startPoint && endPoint))
                ? 'Clear Route' 
                : waitingForDestination 
                ? 'Cancel' 
                : 'Plan Route'
              }
            </span>
          </button>
        </div>

        {/* Turn-by-Turn Navigation Panel */}
        {currentInstruction && routeActive && (
          <div className="absolute bottom-6 left-6 z-[1000] max-w-80">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                  {getInstructionIcon(currentInstruction.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {currentInstruction.text}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentInstruction.distance > 0 ? `in ${Math.round(currentInstruction.distance)}m` : 'Now'}
                  </p>
                </div>
              </div>
              
              {/* Safety indicator */}
              {currentRoute?.safety?.score && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Route Safety:</span>
                    <div className="flex items-center space-x-1">
                      <FiShield className={`w-3 h-3 ${
                        currentRoute.safety.score >= 4 ? 'text-green-600' : 
                        currentRoute.safety.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                      <span className={`font-medium ${
                        currentRoute.safety.score >= 4 ? 'text-green-600' : 
                        currentRoute.safety.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {currentRoute.safety.score}/5
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOS Button */}
        <SOSButton currentLocation={currentLocation} />
      </div>

      {/* Sidebar - Only open manually, don't auto-open */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-[2000] ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Safe Route</h2>
              <p className="text-sm text-gray-600">Stay safe, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto h-full scrollbar-thin" style={{ maxHeight: 'calc(100vh - 90px)' }}>
          {activePanel ? (
            renderActivePanel()
          ) : (
            <div className="p-6 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <FiShield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Safety Score</p>
                  <p className="text-lg font-bold text-blue-600">
                    {currentRoute?.safety?.score ? `${currentRoute.safety.score}/5` : '4.2/5'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <FiNavigation className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Safe Routes</p>
                  <p className="text-lg font-bold text-green-600">24</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => togglePanel('profile')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <FiUser className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Profile</span>
                </button>
                
                <button
                  onClick={() => togglePanel('crime-report')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <FiAlertTriangle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Report Crime</span>
                </button>
                
                <button
                  onClick={() => togglePanel('route-rating')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <FiStar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Rate Route</span>
                </button>
              </div>

              {/* Current Location Info */}
              {currentLocation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
                  <p className="text-sm text-gray-600">
                    Lat: {currentLocation.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lng: {currentLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Accuracy: {currentLocation.accuracy}m
                  </p>
                </div>
              )}

              {/* Current Route Info */}
              {currentRoute && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Active Route</h3>
                  <p className="text-sm text-blue-700">
                    Safety: {currentRoute.safety?.score || 'N/A'}/5
                  </p>
                  {currentRoute.distance && (
                    <p className="text-sm text-blue-700">
                      Distance: {(currentRoute.distance / 1000).toFixed(2)} km
                    </p>
                  )}
                  {currentRoute.duration && (
                    <p className="text-sm text-blue-700">
                      Duration: {Math.round(currentRoute.duration / 60)} min
                    </p>
                  )}
                </div>
              )}

              {/* Safety Tracking Info */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2 flex items-center">
                  <FiShield className="w-4 h-4 mr-2" />
                  How Safety Works
                </h3>
                <div className="text-xs text-green-700 space-y-2">
                  <p>🔍 <strong>Real Data Sources:</strong></p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• UK Police Crime API</li>
                    <li>• OpenStreetMap safety data</li>
                    <li>• Location-based risk analysis</li>
                    <li>• Historical incident patterns</li>
                  </ul>
                  <p>📊 <strong>Safety Score:</strong></p>
                  <div className="grid grid-cols-1 gap-1 text-xs ml-4">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      4-5: Very Safe
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      3-4: Moderate
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      1-3: High Risk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[1500]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Location Permission Modal */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Location Access Required
              </h3>
              
              <p className="text-gray-600 mb-6">
                Safe Route Navigator needs your location to provide:
              </p>

              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center space-x-2">
                  <FiShield className="w-4 h-4 text-green-600" />
                  <span>Safe route navigation from your location</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FiAlertTriangle className="w-4 h-4 text-orange-600" />
                  <span>Nearby safety alerts and crime data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-red-600" />
                  <span>Emergency SOS features</span>
                </li>
              </ul>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowLocationPrompt(false);
                    window.location.reload();
                  }}
                  className="w-full btn-primary"
                >
                  <FiTarget className="w-4 h-4 mr-2" />
                  Try Again & Allow Location
                </button>
                
                <button
                  onClick={() => setShowLocationPrompt(false)}
                  className="w-full text-gray-500 hover:text-gray-700 py-2"
                >
                  Continue with Default Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;