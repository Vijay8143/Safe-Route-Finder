import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiSearch, FiNavigation, FiUsers, FiTrendingUp } from 'react-icons/fi';
import newsService from '../services/newsService';
import { motion } from 'framer-motion';

const CitySelector = ({ selectedCity, onCityChange, onLocationChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [popularCities] = useState([
    'delhi', 'mumbai', 'bangalore', 'kolkata', 'chennai', 'hyderabad', 
    'pune', 'ahmedabad', 'jaipur', 'varanasi'
  ]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load all supported cities
    const supportedCities = newsService.getSupportedCities();
    setCities(supportedCities);
    setFilteredCities(supportedCities);
  }, []);

  useEffect(() => {
    // Filter cities based on search query
    if (searchQuery.trim()) {
      const filtered = newsService.searchCities(searchQuery);
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    console.log('🎯 City selected:', city);
    
    // Pass the complete city object instead of just the name
    onCityChange(city);
    
    // Update map location
    if (onLocationChange) {
      onLocationChange({
        lat: city.lat,
        lng: city.lng,
        city: city.displayName,
        state: city.state
      });
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };

  const getCurrentCityData = () => {
    return cities.find(city => city.name === selectedCity) || cities[0];
  };

  const getPopularCities = () => {
    return cities.filter(city => popularCities.includes(city.name));
  };

  const getCityStats = (cityName) => {
    // Mock stats - in real app, these would come from actual data
    const stats = {
      'delhi': { population: '32M', safetyRating: 3.5, incidents: 145 },
      'mumbai': { population: '20M', safetyRating: 4.0, incidents: 98 },
      'bangalore': { population: '13M', safetyRating: 4.2, incidents: 67 },
      'kolkata': { population: '15M', safetyRating: 3.8, incidents: 89 },
      'chennai': { population: '11M', safetyRating: 4.1, incidents: 54 },
      'hyderabad': { population: '10M', safetyRating: 4.0, incidents: 43 },
      'varanasi': { population: '1.4M', safetyRating: 3.7, incidents: 23 },
    };
    
    return stats[cityName] || { population: 'N/A', safetyRating: 3.5, incidents: 0 };
  };

  const currentCity = getCurrentCityData();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current City Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl p-4 text-left hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
              <FiMapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentCity?.displayName || 'Select City'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentCity?.state || 'Choose your location'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentCity && (
              <div className="text-right text-sm">
                <div className="flex items-center text-gray-600">
                  <FiUsers className="w-4 h-4 mr-1" />
                  {getCityStats(currentCity.name).population}
                </div>
                <div className="flex items-center text-teal-600">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  Safety: {getCityStats(currentCity.name).safetyRating}/5
                </div>
              </div>
            )}
            
            <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
        >
          <div className="p-2">
            <div className="relative">
              <FiSearch className="absolute w-4 h-4 text-gray-400 top-1/2 left-3 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-transparent rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCities.length > 0 ? (
              <div className="p-2">
                {!searchQuery && <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">All Cities</h4>}
                {filteredCities.map((city) => {
                  const stats = getCityStats(city.name);
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full p-3 text-left rounded-lg transition-all duration-200 hover:bg-teal-50 ${
                        selectedCity === city.name 
                          ? 'bg-teal-50 border border-teal-300' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{city.displayName}</div>
                          <div className="text-sm text-gray-600">{city.state}</div>
                        </div>
                        
                        <div className="text-right text-xs text-gray-500">
                          <div className="flex items-center">
                            <FiUsers className="w-3 h-3 mr-1" />
                            {stats.population}
                          </div>
                          <div className="flex items-center text-teal-600">
                            <FiTrendingUp className="w-3 h-3 mr-1" />
                            {stats.safetyRating}/5
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FiMapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No cities found</p>
                <p className="text-xs text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{cities.length} cities available</span>
              <button 
                onClick={() => {
                  // Get user's current location
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      onLocationChange({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        city: 'Current Location',
                        state: 'GPS'
                      });
                      setIsOpen(false);
                    });
                  }
                }}
                className="flex items-center text-teal-600 hover:text-teal-800"
              >
                <FiNavigation className="w-3 h-3 mr-1" />
                Use Current Location
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CitySelector; 