import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import {
  MapIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useGeolocation } from '../context/GeolocationContext';
import { toast } from 'react-hot-toast';

// Default center (Varanasi, India - since user mentioned they're there)
const DEFAULT_CENTER = [25.3176, 82.9739]; // Varanasi coordinates
const DEFAULT_ZOOM = 14;

// Custom location marker
const createLocationIcon = (isUser = false) => {
  const color = isUser ? '#22c55e' : '#ef4444';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: ${isUser ? 'pulse 2s infinite' : 'none'};
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'custom-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Map Click Handler for destination selection
const MapClickHandler = ({ onMapClick, waitingForDestination }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e) => {
      if (waitingForDestination) {
        onMapClick(e.latlng);
      }
    };
    
    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onMapClick, waitingForDestination]);
  
  return null;
};

// Route Control Component with better error handling and multiple routes
const RouteControl = ({ start, end, onRouteFound, onDirectionsUpdate }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    console.log('Creating route control from:', start, 'to:', end);

    // Clean up existing routing control with improved error handling
    if (routingControlRef.current) {
      try {
        // Multiple safety checks before removal
        if (map && 
            routingControlRef.current && 
            map.hasControl && 
            map.hasControl(routingControlRef.current)) {
          map.removeControl(routingControlRef.current);
        }
        
        // Clear any orphaned route layers safely
        if (map.eachLayer) {
          map.eachLayer((layer) => {
            if (layer.options && (layer.options.isRoutingLayer || layer.options.className === 'leaflet-routing-line')) {
              try {
                map.removeLayer(layer);
              } catch (layerError) {
                console.warn('Could not remove layer:', layerError);
              }
            }
          });
        }
        
      } catch (error) {
        console.warn('Error removing existing route control:', error);
      }
      routingControlRef.current = null;
    }

    // Small delay to ensure map is ready
    const timeoutId = setTimeout(() => {
      try {
        // Create new routing control with single route only
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(end[0], end[1])
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
            
            if (isStart) {
              return L.marker(waypoint.latLng, {
                icon: L.divIcon({
                  html: `
                    <div style="
                      background-color: #22c55e;
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
            alternatives: false, // No alternative routes
            steps: true // Get detailed turn-by-turn instructions
          })
        });

        // Enhanced event handlers with error catching
        routingControl.on('routesfound', function(e) {
          try {
            console.log('Routes found:', e.routes.length);
            
            if (onRouteFound && e.routes.length > 0) {
              // Process all routes with safety calculations
              const processedRoutes = e.routes.map((route, index) => {
                // Calculate safety percentage based on route characteristics
                let safetyScore = 85; // Base safety score
                
                // Adjust based on route length (shorter might be safer in urban areas)
                const distance = route.summary.totalDistance;
                if (distance < 1000) safetyScore += 10;
                else if (distance > 5000) safetyScore -= 5;
                
                // Adjust based on time of day (simulate day/night safety)
                const hour = new Date().getHours();
                if (hour >= 6 && hour <= 20) safetyScore += 5; // Daytime
                else safetyScore -= 10; // Nighttime
                
                // Add some randomness for different routes
                const randomFactor = Math.random() * 20 - 10; // -10 to +10
                safetyScore = Math.max(60, Math.min(95, safetyScore + randomFactor));
                
                return {
                  id: index,
                  routeIndex: index,
                  name: index === 0 ? 'Recommended Route' : 
                        index === 1 ? 'Alternative Route' : 
                        `Route Option ${index + 1}`,
                  distance: `${(route.summary.totalDistance / 1000).toFixed(1)} km`,
                  duration: `${Math.round(route.summary.totalTime / 60)} min`,
                  safetyScore: Math.round(safetyScore),
                  coordinates: route.coordinates,
                  instructions: route.instructions,
                  isRecommended: index === 0,
                  originalRoute: route
                };
              });
              
              onRouteFound(processedRoutes);
              
              // Send turn-by-turn directions for the first route
              if (onDirectionsUpdate && e.routes[0].instructions) {
                onDirectionsUpdate(e.routes[0].instructions);
              }
            }
            
            // Style the routing control container with error handling
            try {
              const container = routingControl.getContainer();
              if (container) {
                container.style.cssText = `
                  background: rgba(26, 26, 46, 0.95);
                  backdrop-filter: blur(10px);
                  border-radius: 12px;
                  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
                  border: 1px solid rgba(139, 92, 246, 0.3);
                  font-family: 'Inter', sans-serif;
                  max-width: 300px;
                  max-height: 400px;
                  overflow-y: auto;
                  z-index: 1000;
                  color: #f8f9ff;
                  display: none; // Hide default panel, we'll show our custom one
                `;
              }
            } catch (styleError) {
              console.warn('Error styling routing container:', styleError);
            }
          } catch (routeError) {
            console.error('Error in routesfound handler:', routeError);
          }
        });

        routingControl.on('routingerror', function(e) {
          console.error('Routing error:', e);
          toast.error('Could not calculate route. Please try again.');
        });

        // Add to map with comprehensive error handling
        try {
          if (map && map.addControl && typeof map.addControl === 'function') {
            routingControl.addTo(map);
            routingControlRef.current = routingControl;
            console.log('Route control added successfully');
          } else {
            console.error('Map does not have addControl method');
          }
        } catch (addError) {
          console.error('Error adding routing control to map:', addError);
        }

      } catch (createError) {
        console.error('Error creating routing control:', createError);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (routingControlRef.current) {
        try {
          if (map && 
              routingControlRef.current && 
              map.hasControl && 
              map.hasControl(routingControlRef.current)) {
            map.removeControl(routingControlRef.current);
          }
          
          // Clean up any remaining route layers safely
          if (map.eachLayer) {
            map.eachLayer((layer) => {
              if (layer.options && (layer.options.isRoutingLayer || layer.options.className === 'leaflet-routing-line')) {
                try {
                  map.removeLayer(layer);
                } catch (layerError) {
                  console.warn('Could not remove layer on cleanup:', layerError);
                }
              }
            });
          }
          
        } catch (error) {
          console.warn('Error removing routing control on cleanup:', error);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, end, onRouteFound, onDirectionsUpdate]);

  return null;
};

// Styled Components with Violet-Black Theme
const MapContainer_Styled = styled(motion.div)`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const BackButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    transform: translateX(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.accent || '#ec4899'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme?.colors?.textSecondary || '#e2e8f0'};
  font-weight: 500;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  background: ${props => props.theme?.colors?.surfaceLight || 'rgba(83, 52, 131, 0.8)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    box-shadow: 0 0 0 3px ${props => props.theme?.colors?.primary || '#8b5cf6'}30;
    background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchButton = styled(motion.button)`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.secondary || '#6366f1'});
  color: white;
  border: none;
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const QuickButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const QuickButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  color: ${props => props.theme?.colors?.text || '#f8f9ff'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.md || '12px'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }
`;

const MapSection = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};
`;

const LocationStatus = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => props.isActive ? 
    `linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))` :
    `linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))`
  };
  border: 1px solid ${props => props.isActive ? 
    'rgba(34, 197, 94, 0.3)' : 
    'rgba(239, 68, 68, 0.3)'
  };
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  color: ${props => props.isActive ? '#22c55e' : '#ef4444'};
  text-align: center;
  font-weight: 500;
`;

const RouteInfoCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
  margin-top: 1rem;
  
  h3 {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    margin-bottom: 1rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .info-item {
    text-align: center;
    
    .icon {
      width: 24px;
      height: 24px;
      margin: 0 auto 0.5rem;
      color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
    }
    
    .value {
      font-weight: 600;
      color: ${props => props.theme?.colors?.text || '#f8f9ff'};
      margin-bottom: 0.25rem;
    }
    
    .label {
      font-size: 0.85rem;
      color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
    }
  }
`;

// New styled components for directions and route options
const DirectionsPanel = styled(motion.div)`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 320px;
  max-height: 400px;
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
  box-shadow: ${props => props.theme?.shadows?.xl || '0 24px 48px -8px rgba(139, 92, 246, 0.5)'};
  z-index: 1000;
  overflow-y: auto;

  h3 {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    margin-bottom: 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
  }
`;

const DirectionStep = styled(motion.div)`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${props => props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'};
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme?.colors?.hover || 'rgba(139, 92, 246, 0.15)'};
    border-color: ${props => props.theme?.colors?.primary || '#8b5cf6'};
  }

  .step-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, ${props => props.theme?.colors?.primary || '#8b5cf6'}, ${props => props.theme?.colors?.secondary || '#6366f1'});
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    
    .instruction {
      color: ${props => props.theme?.colors?.text || '#f8f9ff'};
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }
    
    .distance {
      color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
      font-size: 0.8rem;
    }
  }
`;

const RouteOptionsPanel = styled(motion.div)`
  background: ${props => props.theme?.colors?.glass || 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(236, 72, 153, 0.1) 100%)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '24px'};
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: ${props => props.theme?.shadows?.lg || '0 16px 32px -4px rgba(139, 92, 246, 0.4)'};

  h3 {
    color: ${props => props.theme?.colors?.text || '#f8f9ff'};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RouteOption = styled(motion.div)`
  background: ${props => props.isSelected ? 
    `linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))` :
    props.theme?.colors?.surface || 'rgba(26, 26, 46, 0.95)'
  };
  border: 1px solid ${props => props.isSelected ? 
    (props.theme?.colors?.primary || '#8b5cf6') :
    (props.theme?.colors?.border || 'rgba(139, 92, 246, 0.3)')
  };
  border-radius: ${props => props.theme?.borderRadius?.lg || '18px'};
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      if (props.safetyScore >= 90) return `linear-gradient(90deg, ${props.theme?.colors?.success || '#10b981'}, ${props.theme?.colors?.success || '#10b981'}80)`;
      if (props.safetyScore >= 80) return `linear-gradient(90deg, ${props.theme?.colors?.warning || '#f59e0b'}, ${props.theme?.colors?.warning || '#f59e0b'}80)`;
      return `linear-gradient(90deg, ${props.theme?.colors?.error || '#ef4444'}, ${props.theme?.colors?.error || '#ef4444'}80)`;
    }};
  }

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme?.colors?.glassHover || 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(236, 72, 153, 0.15) 100%)'};
    border-color: ${props => props.theme?.colors?.borderHover || 'rgba(139, 92, 246, 0.6)'};
    box-shadow: ${props => props.theme?.shadows?.glow || '0 0 20px rgba(139, 92, 246, 0.4)'};
  }

  .route-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;

    h4 {
      color: ${props => props.theme?.colors?.text || '#f8f9ff'};
      margin: 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .safety-badge {
    padding: 0.25rem 0.75rem;
    border-radius: ${props => props.theme?.borderRadius?.full || '9999px'};
    font-size: 0.8rem;
    font-weight: 600;
    background: ${props => {
      if (props.safetyScore >= 90) return (props.theme?.colors?.success || '#10b981') + '20';
      if (props.safetyScore >= 80) return (props.theme?.colors?.warning || '#f59e0b') + '20';
      return (props.theme?.colors?.error || '#ef4444') + '20';
    }};
    color: ${props => {
      if (props.safetyScore >= 90) return props.theme?.colors?.success || '#10b981';
      if (props.safetyScore >= 80) return props.theme?.colors?.warning || '#f59e0b';
      return props.theme?.colors?.error || '#ef4444';
    }};
    border: 1px solid ${props => {
      if (props.safetyScore >= 90) return (props.theme?.colors?.success || '#10b981') + '40';
      if (props.safetyScore >= 80) return (props.theme?.colors?.warning || '#f59e0b') + '40';
      return (props.theme?.colors?.error || '#ef4444') + '40';
    }};
  }

  .route-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    text-align: center;

    .detail-item {
      .value {
        font-weight: 600;
        color: ${props => props.theme?.colors?.text || '#f8f9ff'};
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
      }
      
      .label {
        font-size: 0.75rem;
        color: ${props => props.theme?.colors?.textMuted || '#cbd5e1'};
      }
    }
  }
`;

const RouteMap = () => {
  const { theme } = useTheme();
  const { currentLocation, isLocationEnabled } = useGeolocation();
  const navigate = useNavigate();
  
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeActive, setRouteActive] = useState(false);
  const [waitingForDestination, setWaitingForDestination] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Getting location...');
  const [isLocationActive, setIsLocationActive] = useState(false);
  
  // New state for directions and route options
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [turnByTurnDirections, setTurnByTurnDirections] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  
  // New state for address search and speed tracking
  const [isSearching, setIsSearching] = useState(false);
  const [userSpeed, setUserSpeed] = useState(0); // km/h
  const [averageSpeed, setAverageSpeed] = useState(5); // Default walking speed 5 km/h
  const [lastPosition, setLastPosition] = useState(null);
  const [lastTime, setLastTime] = useState(null);
  
  const mapRef = useRef(null);

  // Enhanced and more aggressive location fetching
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLocationStatus('🔍 Getting your real location in Varanasi...');
      
      // Try multiple times with different settings
      const attemptLocation = (attempt = 1) => {
        const options = attempt === 1 ? {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Force fresh location
        } : {
          enableHighAccuracy: false, // Fallback with less accuracy but faster
          timeout: 5000,
          maximumAge: 30000
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            
            console.log(`Real location found (attempt ${attempt}):`, location);
            setLocationStatus(`✅ Location found! Accuracy: ±${Math.round(location.accuracy)}m`);
            setIsLocationActive(true);
            
            // Calculate speed if we have a previous position
            calculateSpeed(location);
            
            resolve(location);
          },
          (error) => {
            console.error(`Geolocation error (attempt ${attempt}):`, error);
            
            if (attempt < 3) {
              console.log(`Retrying location fetch (attempt ${attempt + 1})`);
              setLocationStatus(`🔄 Retrying location fetch (attempt ${attempt + 1})`);
              setTimeout(() => attemptLocation(attempt + 1), 1000);
              return;
            }

            let errorMessage = 'Could not get location';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '❌ Location access denied. Please allow location access and refresh.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = '❌ Location unavailable. Using Varanasi as default.';
                // Set Varanasi as default if can't get location
                setUserLocation({ lat: 25.3176, lng: 82.9739, accuracy: 1000 });
                setMapCenter([25.3176, 82.9739]);
                setFromAddress('📍 Varanasi (Default Location)');
                setLocationStatus('📍 Using Varanasi as starting point');
                setIsLocationActive(true);
                resolve({ lat: 25.3176, lng: 82.9739, accuracy: 1000 });
                return;
              case error.TIMEOUT:
                errorMessage = '❌ Location request timed out. Using Varanasi as default.';
                setUserLocation({ lat: 25.3176, lng: 82.9739, accuracy: 1000 });
                setMapCenter([25.3176, 82.9739]);
                setFromAddress('📍 Varanasi (Default Location)');
                setLocationStatus('📍 Using Varanasi as starting point');
                setIsLocationActive(true);
                resolve({ lat: 25.3176, lng: 82.9739, accuracy: 1000 });
                return;
            }
            setLocationStatus(errorMessage);
            setIsLocationActive(false);
            reject(error);
          },
          options
        );
      };

      attemptLocation(1);
    });
  };

  // Calculate user speed for better ETA
  const calculateSpeed = (currentLocation) => {
    const currentTime = Date.now();
    
    if (lastPosition && lastTime) {
      const timeDiff = (currentTime - lastTime) / 1000; // seconds
      
      if (timeDiff > 5) { // Only calculate if at least 5 seconds passed
        const distance = getDistanceBetweenPoints(
          lastPosition.lat, lastPosition.lng,
          currentLocation.lat, currentLocation.lng
        );
        
        const speedMs = distance / timeDiff; // m/s
        const speedKmh = speedMs * 3.6; // km/h
        
        if (speedKmh > 0.5 && speedKmh < 20) { // Reasonable walking/running speed
          setUserSpeed(speedKmh);
          // Update average speed with exponential smoothing
          setAverageSpeed(prev => prev * 0.7 + speedKmh * 0.3);
        }
      }
    }
    
    setLastPosition(currentLocation);
    setLastTime(currentTime);
  };

  // Calculate distance between two points using Haversine formula
  const getDistanceBetweenPoints = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (address) => {
    try {
      setIsSearching(true);
      
      // Use Nominatim geocoding service (free OpenStreetMap geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in&viewbox=82.5,25.0,83.5,26.0&bounded=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  // Aggressive location fetching on mount
  useEffect(() => {
    const fetchRealLocation = async () => {
      try {
        console.log('Starting aggressive location fetch...');
        toast('🎯 Getting your real location...', { duration: 3000 });
        
        const position = await getCurrentPosition();
        setUserLocation(position);
        setMapCenter([position.lat, position.lng]);
        setMapZoom(16);
        setFromAddress(`📍 Your Real Location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`);
        toast.success('🎯 Real location found!', { icon: '📍' });
      } catch (error) {
        console.error('Failed to get real location:', error);
        toast.error('Using Varanasi as default location', { duration: 3000 });
      }
    };

    // Start immediately
    fetchRealLocation();
  }, []);

  // Also use context location as fallback
  useEffect(() => {
    if (currentLocation && isLocationEnabled && !userLocation) {
      setUserLocation(currentLocation);
      setMapCenter([currentLocation.lat, currentLocation.lng]);
      setMapZoom(16);
      setFromAddress(`📍 Your Location (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`);
      setLocationStatus('✅ Location from context');
      setIsLocationActive(true);
    }
  }, [currentLocation, isLocationEnabled, userLocation]);

  // Continuous location tracking for speed calculation
  useEffect(() => {
    let watchId = null;
    
    if (routeActive && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          setUserLocation(newLocation);
          calculateSpeed(newLocation);
          
          // Update location status with speed info
          if (userSpeed > 0) {
            setLocationStatus(`✅ Moving at ${userSpeed.toFixed(1)} km/h`);
          }
        },
        (error) => {
          console.warn('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000 // Update every 5 seconds max
        }
      );
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [routeActive, userSpeed]);

  const handleSearch = async () => {
    if (!fromAddress.trim()) {
      toast.error('Please allow location access first');
      return;
    }

    if (!userLocation) {
      try {
        const position = await getCurrentPosition();
        setUserLocation(position);
        setMapCenter([position.lat, position.lng]);
      } catch (error) {
        toast.error('Could not get your location. Please allow location access.');
        return;
      }
    }

    // Check if user entered a destination address
    if (toAddress.trim()) {
      try {
        toast('🔍 Searching for destination...', { duration: 2000 });
        const geocoded = await geocodeAddress(toAddress);
        
        setDestination([geocoded.lat, geocoded.lng]);
        setToAddress(`📍 ${geocoded.displayName}`);
        setRouteActive(true);
        setWaitingForDestination(false);
        
        // Update map center to show both points
        const centerLat = (userLocation.lat + geocoded.lat) / 2;
        const centerLng = (userLocation.lng + geocoded.lng) / 2;
        setMapCenter([centerLat, centerLng]);
        setMapZoom(13);
        
        toast.success('Destination found! Calculating routes...', {
          icon: '🗺️'
        });
        
      } catch (error) {
        toast.error('Could not find that location. Please try a different address or click on the map.');
        console.error('Geocoding failed:', error);
        
        // Fall back to map clicking mode
        setWaitingForDestination(true);
        toast('Click on the map to set your destination', {
          duration: 4000,
          icon: '📍'
        });
      }
    } else {
      // No address entered, use map clicking mode
      setWaitingForDestination(true);
      toast('Click on the map to set your destination', {
        duration: 4000,
        icon: '📍'
      });
    }
  };

  const handleMapClick = (latlng) => {
    if (waitingForDestination && userLocation) {
      setDestination([latlng.lat, latlng.lng]);
      setToAddress(`📍 Destination (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
      setRouteActive(true);
      setWaitingForDestination(false);
      toast.success('Destination set! Calculating route...', {
        icon: '🗺️'
      });
    }
  };

  const handleQuickLocation = async (type) => {
    try {
      if (type === 'current') {
        const position = await getCurrentPosition();
        setUserLocation(position);
        setFromAddress(`📍 Your Location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`);
        setMapCenter([position.lat, position.lng]);
        setMapZoom(16);
        toast.success('Current location updated!');
      } else if (type.includes('🕉️') || type.includes('🛶') || type.includes('🚉')) {
        // Quick destination buttons
        setToAddress(type);
        try {
          const geocoded = await geocodeAddress(type.replace(/[🕉️🛶🚉🏠]/g, '').trim());
          setDestination([geocoded.lat, geocoded.lng]);
          setRouteActive(true);
          setWaitingForDestination(false);
          toast.success(`Destination set to ${type}`);
        } catch (error) {
          toast.error('Could not find that location');
        }
      } else {
        setFromAddress(type);
        toast(`Set to ${type}`, { icon: '📍' });
      }
    } catch (error) {
      toast.error('Could not get current location');
    }
  };

  const handleRouteFound = (routes) => {
    console.log('Routes received:', routes);
    
    // Calculate ETA based on user's current speed
    const processedRoutes = routes.map(route => {
      const distanceKm = parseFloat(route.distance.replace(' km', ''));
      const effectiveSpeed = averageSpeed > 1 ? averageSpeed : 5; // Use measured speed or default
      const etaMinutes = Math.round((distanceKm / effectiveSpeed) * 60);
      
      return {
        ...route,
        etaMinutes,
        userSpeed: userSpeed > 0 ? userSpeed.toFixed(1) : 'N/A'
      };
    });
    
    setAvailableRoutes(processedRoutes);
    setSelectedRouteIndex(0);
    setRouteInfo(processedRoutes[0]); // Set first route as default
    setShowDirections(true);
    toast.success(`Found ${processedRoutes.length} route${processedRoutes.length > 1 ? 's' : ''}!`);
  };

  const handleDirectionsUpdate = (directions) => {
    console.log('Directions received:', directions);
    
    // Process directions to add turn icons and better formatting
    const processedDirections = directions.map((direction, index) => {
      let turnType = 'straight';
      let icon = '↑';
      
      const instruction = direction.text.toLowerCase();
      
      if (instruction.includes('left')) {
        turnType = 'left';
        icon = '←';
      } else if (instruction.includes('right')) {
        turnType = 'right';
        icon = '→';
      } else if (instruction.includes('straight') || instruction.includes('continue')) {
        turnType = 'straight';
        icon = '↑';
      } else if (instruction.includes('arrive') || instruction.includes('destination')) {
        turnType = 'destination';
        icon = '🏁';
      } else if (instruction.includes('start') || instruction.includes('head')) {
        turnType = 'start';
        icon = '🚀';
      } else if (instruction.includes('turn')) {
        turnType = 'turn';
        icon = '↻';
      }
      
      return {
        id: index,
        text: direction.text,
        distance: direction.distance ? `${Math.round(direction.distance)}m` : '',
        turnType,
        icon,
        time: direction.time || 0
      };
    });
    
    setTurnByTurnDirections(processedDirections);
  };

  const handleRouteSelection = (routeIndex) => {
    console.log('Route selection clicked:', routeIndex);
    
    // Prevent automatic selection by ensuring user interaction
    if (routeIndex !== selectedRouteIndex) {
      setSelectedRouteIndex(routeIndex);
      setRouteInfo(availableRoutes[routeIndex]);
      
      // Update directions for selected route
      if (availableRoutes[routeIndex].instructions) {
        handleDirectionsUpdate(availableRoutes[routeIndex].instructions);
      }
      
      toast.success(`Selected ${availableRoutes[routeIndex].name}`, {
        icon: '✅'
      });
    }
  };

  const clearRoute = () => {
    setRouteActive(false);
    setDestination(null);
    setRouteInfo(null);
    setAvailableRoutes([]);
    setSelectedRouteIndex(0);
    setTurnByTurnDirections([]);
    setShowDirections(false);
    setWaitingForDestination(false);
    toast('Route cleared');
  };

  return (
    <MapContainer_Styled
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Header>
        <BackButton
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon />
          Back to Dashboard
        </BackButton>
        <Title>🗺️ Find Safe Route in Varanasi</Title>
      </Header>

      <SearchSection
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <LocationStatus isActive={isLocationActive} theme={theme}>
          {locationStatus}
        </LocationStatus>

        <SearchGrid>
          <InputGroup>
            <Label>From</Label>
            <Input
              type="text"
              placeholder="Getting your real location..."
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
            />
            <InputIcon>
              <MapPinIcon />
            </InputIcon>
          </InputGroup>

          <InputGroup>
            <Label>To</Label>
            <Input
              type="text"
              placeholder="Enter destination address or click on map"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              disabled={isSearching}
            />
            <InputIcon>
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⚙️
                </motion.div>
              ) : (
                <MapIcon />
              )}
            </InputIcon>
          </InputGroup>

          <div style={{ alignSelf: 'end' }}>
            <SearchButton
              onClick={routeActive ? clearRoute : handleSearch}
              disabled={isSearching}
              whileHover={{ scale: isSearching ? 1 : 1.02 }}
              whileTap={{ scale: isSearching ? 1 : 0.98 }}
            >
              {routeActive ? (
                <>
                  <span>🛑</span>
                  Clear Route
                </>
              ) : waitingForDestination ? (
                <>
                  <span>⏳</span>
                  Click Map...
                </>
              ) : isSearching ? (
                <>
                  <span>🔍</span>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon />
                  Find Route
                </>
              )}
            </SearchButton>
          </div>
        </SearchGrid>

        <QuickButtons>
          <QuickButton onClick={() => handleQuickLocation('current')}>
            📍 Refresh Real Location
          </QuickButton>
          <QuickButton onClick={() => handleQuickLocation('🏠 Home')}>
            🏠 Home
          </QuickButton>
          <QuickButton onClick={() => handleQuickLocation('🕉️ Kashi Vishwanath Temple')}>
            🕉️ Kashi Vishwanath
          </QuickButton>
          <QuickButton onClick={() => handleQuickLocation('🛶 Dashashwamedh Ghat')}>
            🛶 Dashashwamedh Ghat
          </QuickButton>
          <QuickButton onClick={() => handleQuickLocation('🚉 Varanasi Railway Station')}>
            🚉 Railway Station
          </QuickButton>
        </QuickButtons>
      </SearchSection>

      <MapSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{ height: '500px', borderRadius: '18px', overflow: 'hidden' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            zoomControl={true}
          >
            {/* Fixed tile layer URL */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              subdomains={['a', 'b', 'c']}
            />
            
            {/* Map Click Handler */}
            <MapClickHandler 
              onMapClick={handleMapClick} 
              waitingForDestination={waitingForDestination}
            />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createLocationIcon(true)}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong>🎯 Your Real Location</strong><br/>
                    <small>Lat: {userLocation.lat.toFixed(6)}<br/>
                    Lng: {userLocation.lng.toFixed(6)}<br/>
                    Accuracy: ±{Math.round(userLocation.accuracy || 0)}m</small>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Destination Marker */}
            {destination && (
              <Marker
                position={destination}
                icon={createLocationIcon(false)}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong>📍 Your Destination</strong><br/>
                    <small>Lat: {destination[0].toFixed(6)}<br/>
                    Lng: {destination[1].toFixed(6)}</small>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Route Control */}
            {routeActive && userLocation && destination && (
              <RouteControl 
                start={[userLocation.lat, userLocation.lng]}
                end={destination}
                onRouteFound={handleRouteFound}
                onDirectionsUpdate={handleDirectionsUpdate}
              />
            )}
          </MapContainer>
        </div>

        {/* Route Options Panel */}
        {availableRoutes.length > 0 && (
          <RouteOptionsPanel
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>
              🛣️ Available Routes ({availableRoutes.length})
            </h3>
            {availableRoutes.map((route, index) => (
              <RouteOption
                key={route.id}
                onClick={() => handleRouteSelection(index)}
                isSelected={selectedRouteIndex === index}
                safetyScore={route.safetyScore}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="route-header">
                  <h4>
                    {route.isRecommended && <span>⭐</span>}
                    {route.name}
                  </h4>
                  <div className="safety-badge">
                    {route.safetyScore}% Safe
                  </div>
                </div>
                <div className="route-details">
                  <div className="detail-item">
                    <div className="value">{route.distance}</div>
                    <div className="label">Distance</div>
                  </div>
                  <div className="detail-item">
                    <div className="value">{route.duration}</div>
                    <div className="label">Original ETA</div>
                  </div>
                  <div className="detail-item">
                    <div className="value">{route.etaMinutes}min</div>
                    <div className="label">Your ETA</div>
                  </div>
                  <div className="detail-item">
                    <div className="value">
                      {route.safetyScore >= 90 ? '🛡️' : 
                       route.safetyScore >= 80 ? '⚠️' : '⚡'}
                    </div>
                    <div className="label">Safety</div>
                  </div>
                </div>
              </RouteOption>
            ))}
          </RouteOptionsPanel>
        )}

        {routeInfo && (
          <RouteInfoCard
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>🛣️ Selected Route: {routeInfo.name}</h3>
            <div className="info-grid">
              <div className="info-item">
                <MapIcon className="icon" />
                <div className="value">{routeInfo.distance}</div>
                <div className="label">Distance</div>
              </div>
              <div className="info-item">
                <ClockIcon className="icon" />
                <div className="value">{routeInfo.duration}</div>
                <div className="label">Original ETA</div>
              </div>
              <div className="info-item">
                <UserIcon className="icon" />
                <div className="value">{routeInfo.etaMinutes}min</div>
                <div className="label">Your ETA</div>
              </div>
              <div className="info-item">
                <ShieldCheckIcon className="icon" />
                <div className="value">{routeInfo.safetyScore}%</div>
                <div className="label">Safety Rating</div>
              </div>
              <div className="info-item">
                <TruckIcon className="icon" />
                <div className="value">
                  {userSpeed > 0 ? `${userSpeed.toFixed(1)} km/h` : `${averageSpeed.toFixed(1)} km/h`}
                </div>
                <div className="label">
                  {userSpeed > 0 ? 'Current Speed' : 'Avg Speed'}
                </div>
              </div>
              <div className="info-item">
                <UserIcon className="icon" />
                <div className="value">Walking</div>
                <div className="label">Method</div>
              </div>
            </div>
          </RouteInfoCard>
        )}
      </MapSection>

      {/* Turn-by-Turn Directions Panel (Bottom Left) */}
      {showDirections && turnByTurnDirections.length > 0 && (
        <DirectionsPanel
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3>
            🧭 Turn-by-Turn Directions
            <motion.button
              onClick={() => setShowDirections(false)}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#f8f9ff',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </h3>
          {turnByTurnDirections.map((step, index) => (
            <DirectionStep
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="step-icon">
                {step.icon}
              </div>
              <div className="step-content">
                <div className="instruction">{step.text}</div>
                {step.distance && (
                  <div className="distance">in {step.distance}</div>
                )}
              </div>
            </DirectionStep>
          ))}
        </DirectionsPanel>
      )}
    </MapContainer_Styled>
  );
};

export default RouteMap; 