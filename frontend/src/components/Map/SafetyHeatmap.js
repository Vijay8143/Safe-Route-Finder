import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { ratingService } from '../../services/api';

const SafetyHeatmap = ({ center }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      fetchHeatmapData(center[0], center[1]);
    }
  }, [center]);

  useEffect(() => {
    if (heatmapData.length > 0 && map) {
      // Remove existing heatmap layer
      if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
      }

      // Process data for heatmap
      const heatData = heatmapData.map(point => {
        // Convert safety score (1-5) to heat intensity (0-1)
        // Lower safety scores = higher heat intensity (more dangerous = red)
        const intensity = (6 - point.avg_safety_score) / 5; // Invert scale
        return [point.lat, point.lng, intensity];
      });

      // Create new heatmap layer
      const newHeatmapLayer = L.heatLayer(heatData, {
        radius: 30,
        blur: 25,
        maxZoom: 18,
        max: 1.0,
        gradient: {
          0.0: '#22c55e', // Green (safe)
          0.2: '#84cc16', // Light green
          0.4: '#eab308', // Yellow
          0.6: '#f97316', // Orange
          0.8: '#ef4444', // Red
          1.0: '#dc2626'  // Dark red (dangerous)
        }
      });

      newHeatmapLayer.addTo(map);
      setHeatmapLayer(newHeatmapLayer);
    }

    return () => {
      if (heatmapLayer && map) {
        map.removeLayer(heatmapLayer);
      }
    };
  }, [heatmapData, map]);

  const fetchHeatmapData = async (lat, lng) => {
    try {
      const response = await ratingService.getSafetyHeatmap(lat, lng, 0.02);
      const data = response.data.data || [];
      
      // Filter out areas with insufficient data
      const filteredData = data.filter(point => 
        point.rating_count >= 2 && 
        point.avg_safety_score > 0
      );
      
      setHeatmapData(filteredData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setHeatmapData([]);
    }
  };

  // This component doesn't render anything directly
  // The heatmap is added to the map via Leaflet's API
  return null;
};

export default SafetyHeatmap; 