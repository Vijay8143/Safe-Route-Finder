import React, { useEffect, useState } from 'react';
import { Polyline, Popup } from 'react-leaflet';

const RouteDisplay = ({ startPoint, endPoint, onRouteCalculated }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (startPoint && endPoint) {
      fetchRoute();
    }
  }, [startPoint, endPoint]);

  const fetchRoute = async () => {
    try {
      console.log('🗺️ Fetching road-based route...');
      
      // Using OpenRouteService (free routing service)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62489c8b07dafe384c6fb3c4a2b32e7b82e6&start=${startPoint.lng},${startPoint.lat}&end=${endPoint.lng},${endPoint.lat}&format=geojson`
      );
      
      if (response.ok) {
        const data = await response.json();
        const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const distance = data.features[0].properties.segments[0].distance / 1000; // Convert to km
        const duration = data.features[0].properties.segments[0].duration / 60; // Convert to minutes
        
        setRouteCoordinates(coordinates);
        setRouteInfo({ distance, duration });
        
        if (onRouteCalculated) {
          onRouteCalculated(distance, duration);
        }
        
        console.log('✅ Route fetched successfully!');
      } else {
        // Fallback to OSRM (Open Source Routing Machine)
        console.log('🔄 Trying OSRM fallback...');
        const osrmResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=geojson`
        );
        
        if (osrmResponse.ok) {
          const osrmData = await osrmResponse.json();
          const coordinates = osrmData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distance = osrmData.routes[0].distance / 1000;
          const duration = osrmData.routes[0].duration / 60;
          
          setRouteCoordinates(coordinates);
          setRouteInfo({ distance, duration });
          
          if (onRouteCalculated) {
            onRouteCalculated(distance, duration);
          }
          
          console.log('✅ OSRM route fetched successfully!');
        } else {
          // Final fallback to straight line
          console.log('⚠️ Using straight line fallback');
          setRouteCoordinates([startPoint, endPoint]);
          const straightDistance = calculateStraightDistance(startPoint, endPoint);
          setRouteInfo({ distance: straightDistance, duration: straightDistance * 3 });
        }
      }
    } catch (error) {
      console.error('❌ Route fetch failed:', error);
      // Fallback to straight line
      setRouteCoordinates([startPoint, endPoint]);
      const straightDistance = calculateStraightDistance(startPoint, endPoint);
      setRouteInfo({ distance: straightDistance, duration: straightDistance * 3 });
    }
  };

  const calculateStraightDistance = (point1, point2) => {
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

  if (routeCoordinates.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {/* White outline for better visibility */}
      <Polyline
        positions={routeCoordinates}
        color="#ffffff"
        weight={8}
        opacity={0.8}
      />
      
      {/* Main teal route line */}
      <Polyline
        positions={routeCoordinates}
        color="#0d9488"
        weight={5}
        opacity={1}
      >
        <Popup>
          <div>
                            <strong>Navigation Route</strong><br/>
            {routeInfo && (
              <>
                Distance: {routeInfo.distance.toFixed(2)} km<br/>
                Est. Time: {Math.round(routeInfo.duration)} minutes<br/>
                Route Type: {routeCoordinates.length > 2 ? 'Following Roads' : 'Direct Path'}
              </>
            )}
          </div>
        </Popup>
      </Polyline>
    </React.Fragment>
  );
};

export default RouteDisplay; 