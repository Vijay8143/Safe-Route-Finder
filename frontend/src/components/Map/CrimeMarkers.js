import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { crimeService } from '../../services/api';
import { FiAlertTriangle, FiClock, FiMapPin } from 'react-icons/fi';

// Create custom crime marker icon
const createCrimeIcon = (severity) => {
  const color = severity === 'critical' ? '#dc2626' : 
                severity === 'high' ? '#ea580c' :
                severity === 'medium' ? '#ca8a04' : '#65a30d';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
    `,
    className: 'custom-crime-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const CrimeMarkers = ({ center }) => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      fetchCrimeData(center[0], center[1]);
    }
  }, [center]);

  const fetchCrimeData = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const response = await crimeService.getCrimeData(lat, lng, 0.01);
      
      // Ensure we always have an array
      const crimeData = response?.data?.data || response?.data || [];
      
      // Validate that it's an array
      if (Array.isArray(crimeData)) {
        setCrimes(crimeData);
      } else {
        console.warn('Crime data is not an array:', crimeData);
        setCrimes([]);
      }
    } catch (error) {
      console.error('Error fetching crime data:', error);
      setError(error.message);
      setCrimes([]); // Ensure crimes is always an array
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    if (!category) return '❗';
    switch (category.toLowerCase()) {
      case 'theft': return '🎒';
      case 'robbery': return '💰';
      case 'assault': return '⚠️';
      case 'harassment': return '😰';
      case 'vandalism': return '🔨';
      default: return '❗';
    }
  };

  // Ensure crimes is always an array before mapping
  const validCrimes = Array.isArray(crimes) ? crimes : [];

  return (
    <>
      {validCrimes.map((crime) => {
        // Validate crime data
        if (!crime || typeof crime.lat !== 'number' || typeof crime.lng !== 'number') {
          console.warn('Invalid crime data:', crime);
          return null;
        }

        return (
          <Marker
            key={crime.id || `${crime.lat}-${crime.lng}-${Math.random()}`}
            position={[crime.lat, crime.lng]}
            icon={createCrimeIcon(crime.severity || 'medium')}
          >
            <Popup
              maxWidth={300}
              className="crime-popup"
            >
              <div className="p-2 min-w-[250px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(crime.category)}</span>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {crime.category || 'Unknown'}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(crime.severity)}`}>
                    {crime.severity || 'unknown'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  {crime.description || 'No description available'}
                </p>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(crime.incident_date || crime.date_occurred)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4" />
                    <span>
                      {crime.lat.toFixed(4)}, {crime.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Safety Tips */}
                {(crime.severity === 'critical' || crime.severity === 'high') ? (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-1 text-red-700 text-xs font-medium mb-1">
                      <FiAlertTriangle className="w-3 h-3" />
                      <span>Safety Alert</span>
                    </div>
                    <p className="text-red-600 text-xs">
                      High risk area. Consider alternative routes and stay alert.
                    </p>
                  </div>
                ) : null}

                {/* Footer */}
                <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  Reported {formatDate(crime.createdAt)}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default CrimeMarkers; 