import newsService from './newsService';

class SmartRouteService {
  constructor() {
    this.dangerZones = new Map(); // Cache for dangerous areas
    this.lastNewsUpdate = new Map(); // Track when news was last fetched for each city
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }

  // Calculate route safety score based on recent news
  async calculateRouteSafety(route, cityName) {
    try {
      // Get recent news if not cached or outdated
      await this.updateDangerZones(cityName);
      
      const routePoints = this.extractRoutePoints(route);
      const dangerZones = this.dangerZones.get(cityName) || [];
      
      let totalRisk = 0;
      let riskFactors = [];
      
      // Check each route point against danger zones
      for (const point of routePoints) {
        const nearbyDangers = this.findNearbyDangers(point, dangerZones);
        
        for (const danger of nearbyDangers) {
          const risk = this.calculatePointRisk(point, danger);
          totalRisk += risk.score;
          
          if (risk.score > 0.3) { // Significant risk
            riskFactors.push({
              location: point,
              incident: danger,
              risk: risk.score,
              distance: risk.distance,
              description: danger.title,
              severity: danger.severity,
              timeAgo: this.getTimeAgo(danger.publishedAt)
            });
          }
        }
      }

      // Calculate overall safety score (1-5 scale)
      const maxPossibleRisk = routePoints.length * 1.0; // Max risk per point
      const riskRatio = totalRisk / maxPossibleRisk;
      const safetyScore = Math.max(1, 5 - (riskRatio * 4));

      return {
        safetyScore: parseFloat(safetyScore.toFixed(1)),
        totalRisk: totalRisk,
        riskFactors: riskFactors.sort((a, b) => b.risk - a.risk),
        recommendation: this.generateSafetyRecommendation(safetyScore, riskFactors),
        alternativeRoutes: await this.suggestAlternativeRoutes(route, dangerZones),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error calculating route safety:', error);
      return {
        safetyScore: 3.5, // Default moderate safety
        totalRisk: 0,
        riskFactors: [],
        recommendation: 'Unable to analyze route safety. Exercise normal caution.',
        alternativeRoutes: [],
        error: error.message
      };
    }
  }

  // Update danger zones from recent news
  async updateDangerZones(cityName) {
    const lastUpdate = this.lastNewsUpdate.get(cityName);
    const now = Date.now();
    
    // Check if update is needed
    if (lastUpdate && (now - lastUpdate) < this.updateInterval) {
      return; // Use cached data
    }

    try {
      console.log(`Updating danger zones for ${cityName}...`);
      const newsData = await newsService.fetchCityNews(cityName, {
        pageSize: 30,
        sources: ['newsapi', 'gnews']
      });

      const dangerZones = this.processNewsIntoDangerZones(newsData.news || []);
      this.dangerZones.set(cityName, dangerZones);
      this.lastNewsUpdate.set(cityName, now);
      
      console.log(`Found ${dangerZones.length} danger zones for ${cityName}`);
      
    } catch (error) {
      console.warn(`Failed to update danger zones for ${cityName}:`, error);
      // Keep existing cached data if available
    }
  }

  // Convert news articles into mappable danger zones
  processNewsIntoDangerZones(newsArticles) {
    return newsArticles
      .filter(article => article.safetyScore > 0.4) // Only significant safety incidents
      .map(article => {
        const locations = article.locations || [];
        
        return locations.map(location => ({
          id: `${article.id}-${location.name}`,
          title: article.title,
          description: article.description,
          lat: location.lat,
          lng: location.lng,
          severity: article.severity,
          confidence: location.confidence || 0.5,
          publishedAt: article.publishedAt,
          source: article.source,
          safetyScore: article.safetyScore,
          radius: this.getSeverityRadius(article.severity), // Danger zone radius in km
          decayRate: this.getSeverityDecayRate(article.severity) // How quickly danger decreases
        }));
      })
      .flat()
      .filter(zone => zone.confidence > 0.3); // Only confident location matches
  }

  // Extract points along route for analysis
  extractRoutePoints(route) {
    if (!route || !route.coordinates) {
      return [];
    }

    const points = [];
    const coords = route.coordinates;
    
    // Sample points every ~500m along route
    const samplingDistance = 0.5; // km
    const totalDistance = route.summary?.totalDistance / 1000 || 5; // Convert to km
    const sampleCount = Math.max(5, Math.ceil(totalDistance / samplingDistance));
    
    for (let i = 0; i < sampleCount && i < coords.length; i++) {
      const index = Math.floor((i / sampleCount) * coords.length);
      if (coords[index]) {
        points.push({
          lat: coords[index].lat,
          lng: coords[index].lng,
          segment: i
        });
      }
    }

    return points;
  }

  // Find danger zones near a specific point
  findNearbyDangers(point, dangerZones, maxDistance = 2) {
    return dangerZones
      .map(zone => ({
        ...zone,
        distance: this.calculateDistance(point.lat, point.lng, zone.lat, zone.lng)
      }))
      .filter(zone => zone.distance <= Math.max(maxDistance, zone.radius))
      .sort((a, b) => a.distance - b.distance);
  }

  // Calculate risk score for a point near a danger zone
  calculatePointRisk(point, dangerZone) {
    const distance = this.calculateDistance(point.lat, point.lng, dangerZone.lat, dangerZone.lng);
    const timeDecay = this.calculateTimeDecay(dangerZone.publishedAt, dangerZone.decayRate);
    
    // Base risk from severity
    let baseRisk = {
      'critical': 1.0,
      'high': 0.8,
      'medium': 0.5,
      'low': 0.2
    }[dangerZone.severity] || 0.3;

    // Distance decay - risk decreases with distance
    const distanceDecay = Math.max(0, 1 - (distance / dangerZone.radius));
    
    // Confidence factor
    const confidenceFactor = dangerZone.confidence;
    
    // Final risk score
    const riskScore = baseRisk * distanceDecay * timeDecay * confidenceFactor;

    return {
      score: Math.max(0, Math.min(1, riskScore)),
      distance: distance,
      timeDecay: timeDecay,
      distanceDecay: distanceDecay
    };
  }

  // Calculate how risk decreases over time
  calculateTimeDecay(publishedAt, decayRate) {
    const now = new Date();
    const incidentTime = new Date(publishedAt);
    const hoursAgo = (now - incidentTime) / (1000 * 60 * 60);
    
    // Risk decreases exponentially over time
    return Math.exp(-hoursAgo / decayRate);
  }

  // Get danger zone radius based on severity
  getSeverityRadius(severity) {
    switch (severity) {
      case 'critical': return 2.0; // 2km radius
      case 'high': return 1.5;     // 1.5km radius
      case 'medium': return 1.0;   // 1km radius
      case 'low': return 0.5;      // 500m radius
      default: return 1.0;
    }
  }

  // Get decay rate (half-life in hours)
  getSeverityDecayRate(severity) {
    switch (severity) {
      case 'critical': return 72; // Relevant for 3 days
      case 'high': return 48;     // Relevant for 2 days
      case 'medium': return 24;   // Relevant for 1 day
      case 'low': return 12;      // Relevant for 12 hours
      default: return 24;
    }
  }

  // Generate safety recommendation
  generateSafetyRecommendation(safetyScore, riskFactors) {
    if (safetyScore >= 4.5) {
      return 'This route appears very safe with no recent incidents reported.';
    } else if (safetyScore >= 3.5) {
      return 'This route has moderate safety. Stay alert and consider traveling during daylight hours.';
    } else if (safetyScore >= 2.5) {
      const topRisk = riskFactors[0];
      return `This route passes near areas with recent incidents${topRisk ? ` including ${topRisk.description.substring(0, 50)}...` : ''}. Consider alternative routes or avoid traveling alone.`;
    } else {
      return 'This route has significant safety concerns. We strongly recommend finding an alternative route or using transportation instead of walking.';
    }
  }

  // Suggest alternative routes avoiding danger zones
  async suggestAlternativeRoutes(originalRoute, dangerZones) {
    // This is a simplified version - in a real app, you'd use routing APIs
    // to generate actual alternative routes that avoid danger zones
    
    const alternatives = [];
    const highRiskZones = dangerZones.filter(zone => 
      zone.severity === 'critical' || zone.severity === 'high'
    );

    if (highRiskZones.length > 0) {
      alternatives.push({
        id: 'safer-route',
        name: 'Safer Route (Avoids Recent Incidents)',
        description: `Alternative route avoiding ${highRiskZones.length} high-risk areas`,
        estimatedSafety: 4.2,
        estimatedTime: '+ 5-10 min',
        avoidedRisks: highRiskZones.length
      });
    }

    // Add generic alternatives
    alternatives.push(
      {
        id: 'main-roads',
        name: 'Main Roads Route',
        description: 'Uses major, well-lit roads with better security',
        estimatedSafety: 4.0,
        estimatedTime: '+ 3-7 min',
        features: ['Well-lit', 'More traffic', 'CCTV coverage']
      },
      {
        id: 'public-transport',
        name: 'Public Transport Route',
        description: 'Combination of walking and public transport',
        estimatedSafety: 4.5,
        estimatedTime: '+ 10-15 min',
        features: ['Weather protected', 'Supervised', 'Safer for night travel']
      }
    );

    return alternatives;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get human-readable time ago
  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }

  // Get danger zones for a city (for map visualization)
  getDangerZones(cityName) {
    return this.dangerZones.get(cityName) || [];
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(cityName = null) {
    if (cityName) {
      this.dangerZones.delete(cityName);
      this.lastNewsUpdate.delete(cityName);
    } else {
      this.dangerZones.clear();
      this.lastNewsUpdate.clear();
    }
  }
}

export default new SmartRouteService(); 