const { validationResult } = require('express-validator');
const globalCrimeService = require('../services/globalCrimeService');

// Helper function to get Crime model (with demo fallback)
const getCrimeModel = () => {
  try {
    const { Crime } = require('../models');
    return Crime;
  } catch (error) {
    // Return mock Crime model for demo mode
    return {
      create: async (data) => ({ id: Date.now(), ...data, created_at: new Date() }),
      findAll: async () => [],
      findByPk: async () => null
    };
  }
};

// Get crime data for a location (works globally)
const getCrimeData = async (req, res) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates or radius'
      });
    }

    // Use global crime service to get data from anywhere in the world
    const crimes = await globalCrimeService.getCrimeDataForLocation(latitude, longitude, searchRadius);

    // Get location info for context
    const locationInfo = await globalCrimeService.getLocationInfo(latitude, longitude);

    res.json({
      success: true,
      data: {
        crimes,
        location: locationInfo,
        total: crimes.length,
        searchArea: {
          center: { lat: latitude, lng: longitude },
          radius: searchRadius
        },
        timestamp: new Date().toISOString(),
        mode: req.isDemoMode ? 'demo' : 'full',
        message: req.isDemoMode ? 'Demo mode - Global crime data simulation' : 'Full database mode'
      }
    });

  } catch (error) {
    console.error('Error fetching crime data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crime data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Report a new crime (store in local database or demo mode)
const reportCrime = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lng, category, description, severity = 'medium', incident_date } = req.body;
    const userId = req.user?.id;

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Get Crime model (with demo fallback)
    const Crime = getCrimeModel();

    // Create crime record
    const crime = await Crime.create({
      lat: latitude,
      lng: longitude,
      category,
      description,
      severity,
      incident_date: incident_date ? new Date(incident_date) : new Date(),
      reported_by: userId
    });

    // Get location context
    const locationInfo = await globalCrimeService.getLocationInfo(latitude, longitude);

    res.status(201).json({
      success: true,
      message: req.isDemoMode ? 
        'Crime reported successfully (demo mode - data simulated)' : 
        'Crime reported successfully',
      data: {
        id: crime.id,
        lat: crime.lat,
        lng: crime.lng,
        category: crime.category,
        description: crime.description,
        severity: crime.severity,
        incident_date: crime.incident_date,
        location: locationInfo,
        created_at: crime.created_at,
        mode: req.isDemoMode ? 'demo' : 'full'
      }
    });

  } catch (error) {
    console.error('Error reporting crime:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report crime',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get crime statistics for an area
const getCrimeStats = async (req, res) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Get crime data
    const crimes = await globalCrimeService.getCrimeDataForLocation(latitude, longitude, searchRadius);

    // Calculate statistics
    const stats = {
      total: crimes.length,
      byCategory: {},
      bySeverity: {},
      recent: 0,
      averageDangerScore: 0
    };

    let totalDangerScore = 0;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    crimes.forEach(crime => {
      // Count by category
      stats.byCategory[crime.category] = (stats.byCategory[crime.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[crime.severity] = (stats.bySeverity[crime.severity] || 0) + 1;
      
      // Count recent crimes
      if (new Date(crime.incident_date) > oneWeekAgo) {
        stats.recent++;
      }
      
      // Sum danger scores
      totalDangerScore += crime.dangerScore || 0;
    });

    stats.averageDangerScore = crimes.length > 0 ? totalDangerScore / crimes.length : 0;
    
    // Calculate safety level
    let safetyLevel = 'unknown';
    if (stats.averageDangerScore < 0.3) safetyLevel = 'safe';
    else if (stats.averageDangerScore < 0.6) safetyLevel = 'moderate';
    else safetyLevel = 'dangerous';

    // Get location info
    const locationInfo = await globalCrimeService.getLocationInfo(latitude, longitude);

    res.json({
      success: true,
      data: {
        stats,
        safetyLevel,
        location: locationInfo,
        recommendations: globalCrimeService.getSafetyRecommendations(
          Math.round((1 - stats.averageDangerScore) * 4 + 1),
          stats.averageDangerScore
        ),
        searchArea: {
          center: { lat: latitude, lng: longitude },
          radius: searchRadius
        },
        mode: req.isDemoMode ? 'demo' : 'full',
        message: req.isDemoMode ? 
          'Global safety analysis (demo mode)' : 
          'Full database safety analysis'
      }
    });

  } catch (error) {
    console.error('Error getting crime stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crime statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get route safety analysis
const getRouteSafety = async (req, res) => {
  try {
    const { waypoints } = req.body;
    
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 waypoints are required for route analysis'
      });
    }

    // Validate waypoints
    const validWaypoints = waypoints.map(point => {
      const lat = parseFloat(point.lat);
      const lng = parseFloat(point.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid waypoint coordinates');
      }
      
      return { lat, lng };
    });

    // Analyze route safety
    const routeAnalysis = await globalCrimeService.getRouteSafetyScore(validWaypoints);

    // Get detailed analysis for each segment
    const segments = [];
    for (let i = 0; i < validWaypoints.length - 1; i++) {
      const start = validWaypoints[i];
      const end = validWaypoints[i + 1];
      const midpoint = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2
      };
      
      const segmentCrimes = await globalCrimeService.getCrimeDataForLocation(
        midpoint.lat, midpoint.lng, 0.005
      );
      
      segments.push({
        start,
        end,
        midpoint,
        crimes: segmentCrimes.length,
        dangerScore: segmentCrimes.reduce((sum, crime) => sum + crime.dangerScore, 0) / Math.max(segmentCrimes.length, 1)
      });
    }

    res.json({
      success: true,
      data: {
        route: {
          waypoints: validWaypoints,
          segments
        },
        analysis: routeAnalysis,
        timestamp: new Date().toISOString(),
        mode: req.isDemoMode ? 'demo' : 'full',
        message: req.isDemoMode ? 
          'Global route safety analysis (demo mode)' : 
          'Full database route analysis'
      }
    });

  } catch (error) {
    console.error('Error analyzing route safety:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze route safety',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCrimeData,
  reportCrime,
  getCrimeStats,
  getRouteSafety
}; 