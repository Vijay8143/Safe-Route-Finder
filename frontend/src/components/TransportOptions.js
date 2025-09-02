import React, { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiDollarSign, FiShield, FiTrendingUp, FiNavigation } from 'react-icons/fi';
import { MdDirectionsWalk, MdDirectionsBike, MdDirectionsBus, MdDirectionsCar } from 'react-icons/md';

const TransportOptions = ({ origin, destination, currentWeather }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock transport data generation
  const generateTransportOptions = () => {
    const baseDistance = Math.random() * 5 + 1; // 1-6 km
    const weatherMultiplier = getWeatherMultiplier(currentWeather?.condition || 'clear');
    
    return [
      {
        id: 'walking',
        type: 'Walking',
        icon: <MdDirectionsWalk className="w-6 h-6" />,
        duration: Math.round(baseDistance * 12 * weatherMultiplier), // ~12 min/km
        cost: 0,
        safety: getSafetyScore('walking', currentWeather),
        emissions: 0,
        calories: Math.round(baseDistance * 50), // ~50 calories/km
        description: 'Direct walking route',
        features: ['Exercise', 'Eco-friendly', 'No cost'],
        availability: true,
        color: 'bg-green-500'
      },
      {
        id: 'cycling',
        type: 'Cycling',
        icon: <MdDirectionsBike className="w-6 h-6" />,
        duration: Math.round(baseDistance * 4 * weatherMultiplier), // ~4 min/km
        cost: 0,
        safety: getSafetyScore('cycling', currentWeather),
        emissions: 0,
        calories: Math.round(baseDistance * 30), // ~30 calories/km
        description: 'Bike-friendly route',
        features: ['Fast', 'Eco-friendly', 'Exercise'],
        availability: currentWeather?.condition !== 'snow',
        color: 'bg-blue-500'
      },
      {
        id: 'bus',
        type: 'Public Bus',
        icon: <MdDirectionsBus className="w-6 h-6" />,
        duration: Math.round(baseDistance * 6 + 15), // ~6 min/km + waiting
        cost: Math.round(baseDistance * 0.5 + 2), // Base fare + distance
        safety: getSafetyScore('bus', currentWeather),
        emissions: Math.round(baseDistance * 40), // g CO2
        calories: 10, // Minimal walking
        description: 'Regular bus service',
        features: ['Affordable', 'Weather protected', 'Scheduled'],
        availability: true,
        color: 'bg-orange-500'
      },
      {
        id: 'rideshare',
        type: 'Ride Share',
        icon: <MdDirectionsCar className="w-6 h-6" />,
        duration: Math.round(baseDistance * 3 + 8), // ~3 min/km + pickup
        cost: Math.round(baseDistance * 2 + 5), // Base + per km
        safety: getSafetyScore('car', currentWeather),
        emissions: Math.round(baseDistance * 120), // g CO2
        calories: 0,
        description: 'Door-to-door service',
        features: ['Fastest', 'Convenient', 'Climate controlled'],
        availability: true,
        color: 'bg-purple-500'
      }
    ].filter(option => option.availability).sort((a, b) => b.safety - a.safety);
  };

  const getWeatherMultiplier = (condition) => {
    switch (condition) {
      case 'rain': return 1.3;
      case 'snow': return 1.8;
      case 'storm': return 2.0;
      default: return 1.0;
    }
  };

  const getSafetyScore = (transport, weather) => {
    let baseScore = {
      walking: 3.5,
      cycling: 3.0,
      bus: 4.5,
      car: 4.8
    }[transport];

    // Weather impact
    if (weather?.condition === 'rain') {
      if (transport === 'walking' || transport === 'cycling') baseScore -= 1;
    }
    if (weather?.condition === 'snow') {
      if (transport === 'walking') baseScore -= 1.5;
      if (transport === 'cycling') baseScore -= 2;
      if (transport === 'car') baseScore -= 0.5;
    }

    // Time of day impact (mock - in real app would use actual time)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      if (transport === 'walking' || transport === 'cycling') baseScore -= 0.5;
    }

    return Math.max(1, Math.min(5, baseScore));
  };

  const getSafetyColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyLabel = (score) => {
    if (score >= 4) return 'Safe';
    if (score >= 3) return 'Moderate';
    return 'Risky';
  };

  useEffect(() => {
    if (origin && destination) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const transportOptions = generateTransportOptions();
        setOptions(transportOptions);
        setLoading(false);
      }, 800);
    }
  }, [origin, destination, currentWeather]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Transport Options</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <FiNavigation className="w-5 h-5 mr-2 text-teal-600" />
        Transport Options
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
              index === 0 
                ? 'border-teal-300 bg-teal-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {index === 0 && (
              <div className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Recommended
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  {option.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{option.type}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="flex items-center text-gray-600">
                    <FiClock className="w-4 h-4 mr-1" />
                    {option.duration}m
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center text-gray-600">
                    <FiDollarSign className="w-4 h-4 mr-1" />
                    {option.cost === 0 ? 'Free' : `$${option.cost}`}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`flex items-center font-medium ${getSafetyColor(option.safety)}`}>
                    <FiShield className="w-4 h-4 mr-1" />
                    {getSafetyLabel(option.safety)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {option.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {feature}
                </span>
              ))}
            </div>

            {(option.calories > 0 || option.emissions > 0) && (
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                {option.calories > 0 && (
                  <span className="flex items-center">
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    {option.calories} cal
                  </span>
                )}
                {option.emissions > 0 && (
                  <span>🌱 {option.emissions}g CO₂</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentWeather?.safetyImpact && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-800">
            <FiMapPin className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Weather Advisory: {currentWeather.safetyImpact.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportOptions; 