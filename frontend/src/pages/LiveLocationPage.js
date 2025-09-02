import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiMapPin, FiClock, FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { sosService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Custom marker for live location
const createLiveLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'live-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const LiveLocationPage = () => {
  const { shareId } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (shareId) {
      fetchLocation();
    }
  }, [shareId]);

  useEffect(() => {
    if (autoRefresh && locationData && !locationData.expired) {
      const interval = setInterval(fetchLocation, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, locationData]);

  const fetchLocation = async () => {
    try {
      const response = await sosService.getLiveLocation(shareId);
      const data = response.data.data;
      
      setLocationData(data);
      setLastUpdate(new Date());
      setError(null);
      
      if (data.expired) {
        setAutoRefresh(false);
        toast.error('Location sharing has expired');
      }
    } catch (error) {
      console.error('Error fetching live location:', error);
      setError('Unable to load location data');
      setAutoRefresh(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading live location..." />;
  }

  if (error || !locationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Location Not Found</h2>
          <p className="text-gray-600 mb-6">
            This location sharing link may have expired or is invalid.
          </p>
          <Link to="/" className="btn-primary">
            Go to Safe Route Navigator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <FiShield className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Live Location</h1>
              </div>
            </div>
            
            <button
              onClick={fetchLocation}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                locationData.expired ? 'bg-red-500' : 'bg-green-500 animate-pulse'
              }`} />
              <h2 className="text-lg font-semibold text-gray-900">
                {locationData.sharer_name || 'Someone'}'s Location
              </h2>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              locationData.expired 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {locationData.expired ? 'Expired' : 'Active'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiMapPin className="w-4 h-4" />
              <span className="text-sm">
                {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <FiClock className="w-4 h-4" />
              <span className="text-sm">
                Updated {formatTimeAgo(locationData.updated_at)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <FiShield className="w-4 h-4" />
              <span className="text-sm">
                Expires {formatTimeAgo(locationData.expires_at)}
              </span>
            </div>
          </div>

          {locationData.message && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                "{locationData.message}"
              </p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
          <MapContainer
            center={[locationData.lat, locationData.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker
              position={[locationData.lat, locationData.lng]}
              icon={createLiveLocationIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {locationData.sharer_name || 'Live Location'}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Lat: {locationData.lat.toFixed(6)}</p>
                    <p>Lng: {locationData.lng.toFixed(6)}</p>
                    <p>Updated: {formatTimeAgo(locationData.updated_at)}</p>
                    {locationData.accuracy && (
                      <p>Accuracy: ±{locationData.accuracy}m</p>
                    )}
                  </div>

                  {locationData.message && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      {locationData.message}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Safety Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                <p className="text-sm text-gray-600">
                  Stay in contact with the person whose location you're tracking
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                <p className="text-sm text-gray-600">
                  If they don't respond for an unusual amount of time, consider reaching out
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                <p className="text-sm text-gray-600">
                  In case of emergency, contact local authorities immediately
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
            <div className="space-y-3">
              <a
                href="tel:911"
                className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Call 911
              </a>
              <a
                href="sms:911"
                className="block w-full bg-red-100 hover:bg-red-200 text-red-700 text-center py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Text 911
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This location is being shared through Safe Route Navigator
          </p>
          <Link 
            to="/" 
            className="inline-block mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Get Safe Route Navigator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveLocationPage; 