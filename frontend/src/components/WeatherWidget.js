import React, { useState, useEffect } from 'react';
import { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiEye, FiWind, FiDroplet, FiThermometer } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const WeatherWidget = ({ latitude, longitude, compact = false }) => {
  const { theme } = useTheme();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock weather data for demo (in real app, you'd use OpenWeatherMap API)
  const generateMockWeather = () => {
    const conditions = ['clear', 'clouds', 'rain', 'snow'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 30) + 5; // 5-35°C
    const humidity = Math.floor(Math.random() * 60) + 40; // 40-100%
    const windSpeed = Math.floor(Math.random() * 15) + 2; // 2-17 km/h
    const visibility = Math.floor(Math.random() * 8) + 2; // 2-10 km

    return {
      condition,
      temperature: temp,
      humidity,
      windSpeed,
      visibility,
      description: getWeatherDescription(condition, temp),
      safetyImpact: getSafetyImpact(condition, visibility, windSpeed)
    };
  };

  const getWeatherDescription = (condition, temp) => {
    const descriptions = {
      clear: temp > 25 ? 'Hot and sunny' : temp > 15 ? 'Clear skies' : 'Cool and clear',
      clouds: 'Partly cloudy',
      rain: 'Light rain',
      snow: 'Light snow'
    };
    return descriptions[condition] || 'Unknown';
  };

  const getSafetyImpact = (condition, visibility, windSpeed) => {
    let score = 5; // Start with good conditions
    
    if (condition === 'rain') score -= 1;
    if (condition === 'snow') score -= 2;
    if (visibility < 5) score -= 1;
    if (windSpeed > 12) score -= 0.5;
    
    if (score >= 4.5) return { level: 'good', message: 'Good walking conditions' };
    if (score >= 3.5) return { level: 'moderate', message: 'Take extra caution' };
    return { level: 'poor', message: 'Consider alternative transport' };
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      clear: <FiSun className="w-5 h-5" />,
      clouds: <FiCloud className="w-5 h-5" />,
      rain: <FiCloudRain className="w-5 h-5" />,
      snow: <FiCloudSnow className="w-5 h-5" />
    };
    return icons[condition] || <FiSun className="w-5 h-5" />;
  };

  useEffect(() => {
    if (latitude && longitude) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        try {
          const mockData = generateMockWeather();
          setWeather(mockData);
          setError(null);
        } catch (err) {
          setError('Failed to load weather data');
        } finally {
          setLoading(false);
        }
      }, 1000);
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-red-200">
        <div className="text-red-600 text-sm">Weather unavailable</div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-3 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-teal-600">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <div className="font-semibold text-sm">{weather.temperature}°C</div>
              <div className="text-xs text-gray-600">{weather.description}</div>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            weather.safetyImpact.level === 'good' ? 'bg-green-500' :
            weather.safetyImpact.level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Current Weather</h3>
        <div className="text-teal-600">
          {getWeatherIcon(weather.condition)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <FiThermometer className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Temperature</span>
          <span className="font-semibold">{weather.temperature}°C</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiDroplet className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Humidity</span>
          <span className="font-semibold">{weather.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiWind className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Wind</span>
          <span className="font-semibold">{weather.windSpeed} km/h</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiEye className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Visibility</span>
          <span className="font-semibold">{weather.visibility} km</span>
        </div>
      </div>

      <div className={`p-3 rounded-lg border-l-4 ${
        weather.safetyImpact.level === 'good' ? 'bg-green-50 border-green-500' :
        weather.safetyImpact.level === 'moderate' ? 'bg-yellow-50 border-yellow-500' : 
        'bg-red-50 border-red-500'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            weather.safetyImpact.level === 'good' ? 'bg-green-500' :
            weather.safetyImpact.level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            weather.safetyImpact.level === 'good' ? 'text-green-800' :
            weather.safetyImpact.level === 'moderate' ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {weather.safetyImpact.message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 