import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { api } from '../services/api';
import globalLocationService from '../services/globalLocationService';
import toast from 'react-hot-toast';

const GlobalRouteControl = ({ 
  waypoints, 
  onRouteFound, 
  showAlternatives = true, 
  avoidDangerZones = true,
  onRouteSafetyUpdate 
}) => {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);
  const [routeAnalysis, setRouteAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crimeData, setCrimeData] = useState([]);

  useEffect(() => {
    if (!map || !waypoints || waypoints.length < 2) return;

    // Clean up existing routing control
    if (routingControl) {
      map.removeControl(routingControl);
    }

    // Create new routing control with global configuration
    const newRoutingControl = L.Routing.control({
      waypoints: waypoints.map(point => L.latLng(point.lat, point.lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: showAlternatives,
      altLineOptions: {
        styles: [
          { color: 'black', opacity: 0.15, weight: 9 },
          { color: 'white', opacity: 0.8, weight: 6 },
          { color: 'orange', opacity: 0.6, weight: 3 }
        ]
      },
      lineOptions: {
        styles: [
          { color: 'black', opacity: 0.15, weight: 9 },
          { color: 'white', opacity: 0.8, weight: 6 },
          { color: '#2563eb', opacity: 0.8, weight: 4 }
        ]
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'walking', // Default to walking for safety
        language: 'en',
        polyline: true,
        overview: 'full'
      }),
      formatter: new L.Routing.Formatter({
        language: 'en',
        units: 'metric'
      }),
      createMarker: function(i, waypoint, n) {
        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          icon: createWaypointIcon(i, n)
        });
        
        return marker;
      },
      plan: L.Routing.plan(waypoints.map(point => L.latLng(point.lat, point.lng)), {
        createMarker: function(i, waypoint, n) {
          return L.marker(waypoint.latLng, {
            draggable: false,
            icon: createWaypointIcon(i, n)
          });
        }
      })
    });

    // Handle route found event
    newRoutingControl.on('routesfound', async (e) => {
      const routes = e.routes;
      const primaryRoute = routes[0];
      
      if (primaryRoute) {
        // Analyze route safety
        await analyzeRouteSafety(primaryRoute);
        
        // Get crime data along the route
        await getCrimeDataForRoute(primaryRoute);
        
        // Call callback with route data
        if (onRouteFound) {
          onRouteFound({
            route: primaryRoute,
            alternatives: routes.slice(1),
            analysis: routeAnalysis,
            crimes: crimeData
          });
        }
      }
    });

    // Handle routing errors
    newRoutingControl.on('routingerror', (e) => {
      console.error('Routing error:', e);
      toast.error('Could not find route. Please try different locations.');
    });

    // Add to map
    newRoutingControl.addTo(map);
    setRoutingControl(newRoutingControl);

    // Cleanup function
    return () => {
      if (newRoutingControl && map) {
        try {
          map.removeControl(newRoutingControl);
        } catch (error) {
          console.warn('Error removing routing control:', error);
        }
      }
    };
  }, [map, waypoints]);

  // Create custom waypoint icons
  const createWaypointIcon = (index, total) => {
    const isStart = index === 0;
    const isEnd = index === total - 1;
    
    let color = '#2563eb';
    let symbol = index + 1;
    
    if (isStart) {
      color = '#10b981';
      symbol = 'S';
    } else if (isEnd) {
      color = '#ef4444';
      symbol = 'E';
    }
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${symbol}</div>
      `,
      className: 'custom-waypoint-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Analyze route safety
  const analyzeRouteSafety = async (route) => {
    setIsAnalyzing(true);
    
    try {
      // Extract key points from route
      const coordinates = route.coordinates || [];
      const samplePoints = [];
      
      // Sample every 10th coordinate or at least 10 points
      const step = Math.max(1, Math.floor(coordinates.length / 10));
      for (let i = 0; i < coordinates.length; i += step) {
        const coord = coordinates[i];
        samplePoints.push({
          lat: coord.lat,
          lng: coord.lng
        });
      }
      
      // Add start and end points if not included
      if (samplePoints.length > 0) {
        const firstCoord = coordinates[0];
        const lastCoord = coordinates[coordinates.length - 1];
        
        if (samplePoints[0].lat !== firstCoord.lat || samplePoints[0].lng !== firstCoord.lng) {
          samplePoints.unshift({ lat: firstCoord.lat, lng: firstCoord.lng });
        }
        
        if (samplePoints[samplePoints.length - 1].lat !== lastCoord.lat || 
            samplePoints[samplePoints.length - 1].lng !== lastCoord.lng) {
          samplePoints.push({ lat: lastCoord.lat, lng: lastCoord.lng });
        }
      }
      
      // Analyze route safety with backend
      const response = await api.post('/api/route-safety', {
        waypoints: samplePoints
      });
      
      const analysis = response.data.data.analysis;
      setRouteAnalysis(analysis);
      
      // Get additional context from global location service
      const startLocation = await globalLocationService.reverseGeocode(
        samplePoints[0].lat, 
        samplePoints[0].lng
      );
      const endLocation = await globalLocationService.reverseGeocode(
        samplePoints[samplePoints.length - 1].lat, 
        samplePoints[samplePoints.length - 1].lng
      );
      
      // Check if route crosses different safety zones
      const locationSafety = await Promise.all([
        globalLocationService.isLocationSafe(samplePoints[0].lat, samplePoints[0].lng),
        globalLocationService.isLocationSafe(samplePoints[samplePoints.length - 1].lat, samplePoints[samplePoints.length - 1].lng)
      ]);
      
      const enhancedAnalysis = {
        ...analysis,
        locations: {
          start: startLocation,
          end: endLocation
        },
        locationSafety: {
          start: locationSafety[0],
          end: locationSafety[1]
        },
        globalRecommendations: getGlobalRouteRecommendations(analysis, locationSafety),
        timeContext: {
          timeOfDay: globalLocationService.getTimeOfDay(),
          isNightTime: globalLocationService.getTimeOfDay() === 'night'
        }
      };
      
      if (onRouteSafetyUpdate) {
        onRouteSafetyUpdate(enhancedAnalysis);
      }
      
    } catch (error) {
      console.error('Error analyzing route safety:', error);
      toast.error('Could not analyze route safety');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get crime data for route
  const getCrimeDataForRoute = async (route) => {
    try {
      const coordinates = route.coordinates || [];
      const allCrimes = [];
      
      // Sample points along route for crime data
      const samplePoints = [];
      const step = Math.max(1, Math.floor(coordinates.length / 5)); // 5 sample points
      
      for (let i = 0; i < coordinates.length; i += step) {
        const coord = coordinates[i];
        samplePoints.push({ lat: coord.lat, lng: coord.lng });
      }
      
      // Get crime data for each sample point
      for (const point of samplePoints) {
        try {
          const response = await api.get(`/api/crime-data?lat=${point.lat}&lng=${point.lng}&radius=0.01`);
          if (response.data.success) {
            allCrimes.push(...response.data.data.crimes);
          }
        } catch (error) {
          console.warn('Error getting crime data for point:', error);
        }
      }
      
      // Remove duplicates and sort by danger score
      const uniqueCrimes = allCrimes.filter((crime, index, self) => 
        index === self.findIndex(c => c.id === crime.id)
      ).sort((a, b) => (b.dangerScore || 0) - (a.dangerScore || 0));
      
      setCrimeData(uniqueCrimes);
      
    } catch (error) {
      console.error('Error getting crime data for route:', error);
    }
  };

  // Get global route recommendations
  const getGlobalRouteRecommendations = (analysis, locationSafety) => {
    const recommendations = [...(analysis.recommendations || [])];
    
    // Add location-specific recommendations
    if (locationSafety[0] && !locationSafety[0].isSafe) {
      recommendations.push('🚨 Starting location has safety concerns');
    }
    
    if (locationSafety[1] && !locationSafety[1].isSafe) {
      recommendations.push('⚠️ Destination area has safety concerns');
    }
    
    // Time-based recommendations
    const timeOfDay = globalLocationService.getTimeOfDay();
    if (timeOfDay === 'night') {
      recommendations.push('🌙 Night travel - extra caution advised');
      recommendations.push('💡 Stay in well-lit areas');
      recommendations.push('📱 Share live location with trusted contact');
    }
    
    // Safety score recommendations
    if (analysis.safetyScore <= 2) {
      recommendations.push('🚨 Consider postponing trip or using transportation');
      recommendations.push('👥 Strongly recommend traveling with others');
    } else if (analysis.safetyScore <= 3) {
      recommendations.push('⚡ Moderate risk - consider alternative route');
      recommendations.push('📞 Keep emergency contacts ready');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (routingControl && map) {
        try {
          map.removeControl(routingControl);
        } catch (error) {
          console.warn('Error removing routing control on unmount:', error);
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything directly
};

export default GlobalRouteControl; 