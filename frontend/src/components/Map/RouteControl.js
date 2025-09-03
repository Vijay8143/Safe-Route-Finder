import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { crimeService } from '../../services/api';

const RouteControl = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const createRouteWithRetry = (startCoords, endCoords, retryCount = 0) => {
    try {
      // Create routing control with NO alternatives (single route only)
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: true,
        collapsible: false,
        // NO alternatives - only one route
        alternatives: false,
        showAlternatives: false,
        createMarker: function(i, waypoint, n) {
          const isStart = i === 0;
          const isEnd = i === n - 1;
          
          if (isStart) {
            return L.marker(waypoint.latLng, {
              icon: L.divIcon({
                html: `
                  <div style="
                    background-color: #10b981;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      width: 8px;
                      height: 8px;
                      background-color: white;
                      border-radius: 50%;
                    "></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                className: 'custom-route-marker'
              })
            });
          } else if (isEnd) {
            return L.marker(waypoint.latLng, {
              icon: L.divIcon({
                html: `
                  <div style="
                    background-color: #ef4444;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      width: 8px;
                      height: 8px;
                      background-color: white;
                      border-radius: 50%;
                    "></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                className: 'custom-route-marker'
              })
            });
          }
          return null;
        },
        lineOptions: {
          styles: [
            {
              color: '#000000',
              weight: 8,
              opacity: 0.6
            },
            {
              color: '#0d9488', // Teal color instead of purple
              weight: 4,
              opacity: 1.0
            }
          ]
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'walking',
          language: 'en',
          polyline: true,
          overview: 'full',
          alternatives: false // Explicitly disable alternatives
        }),
        formatter: new L.Routing.Formatter({
          language: 'en',
          units: 'metric',
          iconCreateFunction: function(instruction, index) {
            // Custom icons for different instruction types
            const type = instruction.type;
            let iconHtml = '';
            
            switch(type) {
              case 'Head':
                iconHtml = '🧭';
                break;
              case 'Left':
                iconHtml = '⬅️';
                break;
              case 'Right':
                iconHtml = '➡️';
                break;
              case 'SharpLeft':
                iconHtml = '↖️';
                break;
              case 'SharpRight':
                iconHtml = '↗️';
                break;
              case 'SlightLeft':
                iconHtml = '↙️';
                break;
              case 'SlightRight':
                iconHtml = '↘️';
                break;
              case 'Continue':
                iconHtml = '⬆️';
                break;
              case 'Arrive':
                iconHtml = '🏁';
                break;
              case 'Roundabout':
                iconHtml = '🔄';
                break;
              default:
                iconHtml = '📍';
            }
            
            return `<span style="font-size: 16px; margin-right: 8px;">${iconHtml}</span>`;
          },
          formatInstruction: function(instruction, i) {
            const icon = this.iconCreateFunction(instruction, i);
            const text = instruction.text || '';
            const distance = instruction.distance ? `(${Math.round(instruction.distance)}m)` : '';
            
            return `${icon}<strong>${text}</strong> ${distance}`;
          }
        })
      });

      // Add custom CSS styling for the routing control
      routingControl.on('routesfound', function(e) {
        console.log('Route found (single route):', e.routes.length);
        retryCountRef.current = 0; // Reset retry count on success
        
        // Style the routing control container
        try {
          const container = routingControl.getContainer();
          if (container) {
            container.style.cssText = `
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              font-family: 'Inter', sans-serif;
              max-width: 300px;
              max-height: 400px;
              overflow-y: auto;
              z-index: 1000;
            `;
            
            // Style the routing instructions
            const instructions = container.querySelectorAll('.leaflet-routing-instruction');
            instructions.forEach(instruction => {
              instruction.style.cssText = `
                padding: 8px 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                font-size: 14px;
                line-height: 1.4;
              `;
            });
            
            // Style the summary with teal gradient
            const summary = container.querySelector('.leaflet-routing-summary');
            if (summary) {
              summary.style.cssText = `
                background: linear-gradient(135deg, #0d9488, #14b8a6);
                color: white;
                padding: 12px;
                border-radius: 12px 12px 0 0;
                font-weight: 600;
              `;
            }
          }
        } catch (error) {
          console.warn('Error styling routing container:', error);
        }
      });

      // Event listeners with improved error handling
      routingControl.on('routesfound', async function(e) {
        try {
          const routes = e.routes;
          const route = routes[0]; // Only use the first (and only) route
          
          console.log('Primary route found:', route);
          
          if (route && onRouteFound) {
            // Analyze route for safety
            const safetyAnalysis = await analyzeRouteSafety(route);
            
            // Add distance and duration info
            const enhancedRoute = {
              ...route,
              safety: safetyAnalysis,
              distance: route.summary?.totalDistance,
              duration: route.summary?.totalTime,
              instructions: route.instructions
            };
            
            onRouteFound(enhancedRoute);
          }
        } catch (error) {
          console.error('Error in routesfound handler:', error);
        }
      });

      routingControl.on('routingerror', function(e) {
        console.error('Routing error:', e);
        
        // Retry logic
        if (retryCount < maxRetries) {
          console.log(`Retrying route calculation (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            // Clean up failed control safely
            try {
              if (routingControl && map && map.hasControl) {
                if (map.hasControl(routingControl)) {
                  map.removeControl(routingControl);
                }
              }
            } catch (cleanupError) {
              console.warn('Error cleaning up failed routing control:', cleanupError);
            }
            
            // Retry with incremented count
            createRouteWithRetry(startCoords, endCoords, retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          console.error('Max retries reached for route calculation');
          if (onRouteFound) {
            onRouteFound({
              error: 'Unable to calculate route after multiple attempts',
              safety: { score: 0, recommendation: 'Route calculation failed' }
            });
          }
        }
      });

      // Add to map with improved error handling
      try {
        if (map && map.addControl && typeof map.addControl === 'function') {
          routingControl.addTo(map);
          routingControlRef.current = routingControl;
          console.log('Route control added successfully');
        } else {
          console.error('Map does not have addControl method');
        }
      } catch (error) {
        console.error('Error adding routing control to map:', error);
        
        // Retry on add failure
        if (retryCount < maxRetries) {
          setTimeout(() => {
            createRouteWithRetry(startCoords, endCoords, retryCount + 1);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error creating routing control:', error);
      
      // Retry on creation failure
      if (retryCount < maxRetries) {
        setTimeout(() => {
          createRouteWithRetry(startCoords, endCoords, retryCount + 1);
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (!map || !start || !end) return;

    console.log('Creating route from:', start, 'to:', end);

    // Complete cleanup of existing routing control
    if (routingControlRef.current) {
      try {
        // Force remove all routing-related layers first
        if (map && map.eachLayer) {
          const layersToRemove = [];
          map.eachLayer((layer) => {
            if (layer.options && (
              layer.options.isRoutingLayer || 
              layer.options.className === 'leaflet-routing-line' ||
              layer._container?.className?.includes('leaflet-routing') ||
              layer.getElement?.()?.className?.includes('leaflet-routing')
            )) {
              layersToRemove.push(layer);
            }
          });
          
          // Remove collected layers safely
          layersToRemove.forEach(layer => {
            try {
              if (map.hasLayer(layer)) {
                map.removeLayer(layer);
              }
            } catch (layerError) {
              console.warn('Could not remove layer:', layerError);
            }
          });
        }
        
        // Remove the routing control itself
        if (map && routingControlRef.current) {
          try {
            // Check multiple ways to detect if control exists
            if (map.hasControl && map.hasControl(routingControlRef.current)) {
              map.removeControl(routingControlRef.current);
            } else if (map.removeControl && typeof map.removeControl === 'function') {
              map.removeControl(routingControlRef.current);
            }
          } catch (controlError) {
            console.warn('Could not remove routing control:', controlError);
          }
        }
        
        // Force clear the routing control's internal state
        if (routingControlRef.current && routingControlRef.current._map) {
          try {
            routingControlRef.current._map = null;
          } catch (e) {
            console.warn('Could not clear routing control map reference:', e);
          }
        }
        
      } catch (error) {
        console.warn('Error removing existing route control:', error);
      }
      routingControlRef.current = null;
    }

    // Reset retry count for new route
    retryCountRef.current = 0;

    // Add a small delay to ensure map is ready
    const timeoutId = setTimeout(() => {
      createRouteWithRetry(start, end, 0);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (routingControlRef.current) {
        try {
          // Force cleanup with comprehensive layer removal
          if (map && map.eachLayer) {
            const layersToRemove = [];
            map.eachLayer((layer) => {
              if (layer.options && (
                layer.options.isRoutingLayer || 
                layer.options.className === 'leaflet-routing-line' ||
                layer._container?.className?.includes('leaflet-routing') ||
                layer.getElement?.()?.className?.includes('leaflet-routing')
              )) {
                layersToRemove.push(layer);
              }
            });
            
            layersToRemove.forEach(layer => {
              try {
                if (map.hasLayer(layer)) {
                  map.removeLayer(layer);
                }
              } catch (layerError) {
                console.warn('Could not remove layer on cleanup:', layerError);
              }
            });
          }
          
          // Remove control with multiple fallbacks
          if (map && routingControlRef.current) {
            try {
              if (map.hasControl && map.hasControl(routingControlRef.current)) {
                map.removeControl(routingControlRef.current);
              } else if (map.removeControl && typeof map.removeControl === 'function') {
                map.removeControl(routingControlRef.current);
              }
            } catch (controlError) {
              console.warn('Could not remove routing control on cleanup:', controlError);
            }
          }
          
          // Force clear internal state
          if (routingControlRef.current && routingControlRef.current._map) {
            try {
              routingControlRef.current._map = null;
            } catch (e) {
              console.warn('Could not clear routing control map reference on cleanup:', e);
            }
          }
          
        } catch (error) {
          console.warn('Error removing routing control on cleanup:', error);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, end, onRouteFound]);

  const analyzeRouteSafety = async (route) => {
    try {
      const coordinates = route.coordinates;
      let totalCrimes = 0;
      let highRiskAreas = 0;
      
      // Sample points along the route for crime analysis
      const samplePoints = [];
      const step = Math.max(1, Math.floor(coordinates.length / 10)); // Sample up to 10 points
      
      for (let i = 0; i < coordinates.length; i += step) {
        samplePoints.push(coordinates[i]);
      }

      // Check each sample point for nearby crimes
      const crimeChecks = samplePoints.map(async (coord) => {
        try {
          const response = await crimeService.getCrimeData(
            coord.lat, 
            coord.lng, 
            0.002 // Smaller radius for route analysis
          );
          return response.data.data || [];
        } catch (error) {
          return [];
        }
      });

      const crimeResults = await Promise.all(crimeChecks);
      
      crimeResults.forEach(crimes => {
        totalCrimes += crimes.length;
        const highRiskCrimes = crimes.filter(crime => 
          crime.severity === 'critical' || crime.severity === 'high'
        );
        if (highRiskCrimes.length > 0) {
          highRiskAreas++;
        }
      });

      // Calculate safety score (1-5)
      const maxExpectedCrimes = samplePoints.length * 2; // Threshold
      const crimeRatio = Math.min(totalCrimes / maxExpectedCrimes, 1);
      const highRiskRatio = highRiskAreas / samplePoints.length;
      
      const safetyScore = Math.max(1, 5 - (crimeRatio * 2 + highRiskRatio * 3));

      return {
        score: Math.round(safetyScore * 10) / 10,
        totalCrimes,
        highRiskAreas,
        recommendation: getSafetyRecommendation(safetyScore, totalCrimes, highRiskAreas),
        analysis: `Route analyzed across ${samplePoints.length} checkpoints`
      };
    } catch (error) {
      console.error('Route safety analysis error:', error);
      return {
        score: 3.0,
        totalCrimes: 0,
        highRiskAreas: 0,
        recommendation: 'Unable to analyze route safety',
        analysis: 'Safety analysis unavailable'
      };
    }
  };

  const getSafetyRecommendation = (score, totalCrimes, highRiskAreas) => {
    if (score >= 4.5) {
      return 'This route appears very safe with low crime activity.';
    } else if (score >= 3.5) {
      return 'This route has moderate safety. Stay alert and consider walking with others.';
    } else if (score >= 2.5) {
      return 'This route passes through areas with elevated crime. Consider alternative routes.';
    } else {
      return 'This route may not be safe. Strongly consider finding an alternative route or using transportation.';
    }
  };

  return null; // This component doesn't render anything directly
};

export default RouteControl; 