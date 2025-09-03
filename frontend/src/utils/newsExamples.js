// Examples of how the news fetching and safety calculation works

import newsService from '../services/newsService';
import smartRouteService from '../services/smartRouteService';

// ===== EXAMPLE 1: Basic News Fetching =====
export const fetchVaranasiNews = async () => {
  try {
    console.log('🔍 Fetching news for Varanasi...');
    
    const newsData = await newsService.fetchCityNews('varanasi', {
      pageSize: 20,
      sources: ['newsapi', 'gnews'] // Multiple sources for better coverage
    });

    console.log('📰 News Results:', {
      city: newsData.city,
      totalArticles: newsData.totalArticles,
      safetyRelevantArticles: newsData.safetyArticles,
      lastUpdated: newsData.lastUpdated
    });

    // Example of what you get:
    newsData.news.forEach((article, index) => {
      console.log(`Article ${index + 1}:`, {
        title: article.title,
        severity: article.severity, // critical/high/medium/low
        safetyScore: article.safetyScore, // 0-1
        locations: article.locations, // Geographic coordinates
        distance: article.distance, // Distance from city center
        timeAgo: new Date(article.publishedAt)
      });
    });

    return newsData;
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    return null;
  }
};

// ===== EXAMPLE 2: Route Safety Analysis =====
export const analyzeRouteSafety = async (routeData, cityName = 'varanasi') => {
  try {
    console.log('🛡️ Analyzing route safety...');
    
    // This integrates with the news data automatically
    const safetyAnalysis = await smartRouteService.calculateRouteSafety(routeData, cityName);

    console.log('📊 Safety Analysis Results:', {
      safetyScore: safetyAnalysis.safetyScore, // 1-5 scale
      totalRisk: safetyAnalysis.totalRisk,
      riskFactorsFound: safetyAnalysis.riskFactors.length,
      recommendation: safetyAnalysis.recommendation
    });

    // Example of risk factors (based on real news)
    safetyAnalysis.riskFactors.forEach((risk, index) => {
      console.log(`Risk Factor ${index + 1}:`, {
        description: risk.description,
        severity: risk.severity,
        distance: `${risk.distance.toFixed(2)}km from route`,
        riskScore: risk.risk,
        timeAgo: risk.timeAgo
      });
    });

    // Alternative routes suggested
    safetyAnalysis.alternativeRoutes.forEach((alt, index) => {
      console.log(`Alternative ${index + 1}:`, {
        name: alt.name,
        estimatedSafety: alt.estimatedSafety,
        estimatedTime: alt.estimatedTime,
        features: alt.features
      });
    });

    return safetyAnalysis;
  } catch (error) {
    console.error('❌ Error analyzing route safety:', error);
    return null;
  }
};

// ===== EXAMPLE 3: Multi-City Support =====
export const demonstrateMultiCitySupport = () => {
  console.log('🌆 Available Cities:');
  
  const cities = newsService.getSupportedCities();
  
  // Group by state
  const citiesByState = cities.reduce((acc, city) => {
    if (!acc[city.state]) acc[city.state] = [];
    acc[city.state].push(city);
    return acc;
  }, {});

  Object.entries(citiesByState).forEach(([state, stateCities]) => {
    console.log(`${state}:`);
    stateCities.forEach(city => {
      console.log(`  • ${city.displayName} (${city.lat}, ${city.lng})`);
    });
  });

  return cities;
};

// ===== EXAMPLE 4: Real API Integration =====
export const setupRealNewsAPIs = () => {
  console.log('🔑 Setting up real news APIs:');
  
  const instructions = {
    step1: {
      title: 'Get NewsAPI Key',
      url: 'https://newsapi.org/',
      description: 'Free tier: 100 requests/day',
      envVar: 'REACT_APP_NEWS_API_KEY'
    },
    step2: {
      title: 'Get GNews Key', 
      url: 'https://gnews.io/',
      description: 'Free tier: 100 requests/day',
      envVar: 'REACT_APP_GNEWS_API_KEY'
    },
    step3: {
      title: 'Get TheNewsAPI Key',
      url: 'https://www.thenewsapi.com/',
      description: 'Free tier: 150 requests/day',
      envVar: 'REACT_APP_THENEWS_API_KEY'
    },
    step4: {
      title: 'Create .env file',
      content: `
# Add to DoubtSolver/frontend/.env
REACT_APP_NEWS_API_KEY=your_newsapi_key_here
REACT_APP_GNEWS_API_KEY=your_gnews_key_here
REACT_APP_THENEWS_API_KEY=your_thenews_key_here
      `
    }
  };

  console.log('Setup Instructions:', instructions);
  return instructions;
};

// ===== EXAMPLE 5: Complete Workflow =====
export const completeWorkflowExample = async () => {
  console.log('🚀 Complete News + Route Safety Workflow:');
  
  try {
    // 1. Select a city
    const cityName = 'varanasi';
    console.log(`1️⃣ Selected city: ${cityName}`);
    
    // 2. Fetch recent news
    const newsData = await fetchVaranasiNews();
    if (!newsData) throw new Error('Failed to fetch news');
    
    // 3. Create a sample route
    const sampleRoute = {
      coordinates: [
        { lat: 25.3176, lng: 82.9739 }, // Varanasi center
        { lat: 25.3200, lng: 82.9800 }, // Sample destination
      ],
      summary: {
        totalDistance: 2500, // meters
        totalTime: 1800     // seconds
      }
    };
    console.log('2️⃣ Created sample route');
    
    // 4. Analyze route safety with news data
    const safetyAnalysis = await analyzeRouteSafety(sampleRoute, cityName);
    if (!safetyAnalysis) throw new Error('Failed to analyze safety');
    
    // 5. Display complete results
    console.log('3️⃣ Complete Analysis:', {
      newsArticles: newsData.safetyArticles,
      routeSafety: safetyAnalysis.safetyScore,
      riskFactors: safetyAnalysis.riskFactors.length,
      recommendation: safetyAnalysis.recommendation,
      alternatives: safetyAnalysis.alternativeRoutes.length
    });
    
    return {
      newsData,
      safetyAnalysis,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Workflow error:', error);
    return { success: false, error: error.message };
  }
};

// ===== EXAMPLE 6: How Data Flows =====
export const explainDataFlow = () => {
  console.log('🔄 How News → Safety Calculation Works:');
  
  const dataFlow = {
    step1: {
      title: 'News Fetching',
      description: 'Searches for safety keywords in city news',
      keywords: ['crime', 'theft', 'assault', 'violence', 'police', 'safety', 'incident'],
      output: 'Filtered articles with safety relevance scores'
    },
    step2: {
      title: 'Location Extraction', 
      description: 'Maps news articles to geographic coordinates',
      methods: ['City name matching', 'Area/locality detection', 'NLP processing'],
      output: 'Articles with lat/lng coordinates and confidence scores'
    },
    step3: {
      title: 'Danger Zone Creation',
      description: 'Converts news incidents into geographic risk areas',
      factors: ['Severity level', 'Time decay', 'Location confidence', 'Incident type'],
      output: 'Risk zones with radius and decay rates'
    },
    step4: {
      title: 'Route Analysis',
      description: 'Checks route points against danger zones',
      process: ['Sample route every 500m', 'Calculate distance to incidents', 'Apply time/severity weighting'],
      output: 'Overall safety score and risk factors'
    },
    step5: {
      title: 'Recommendations',
      description: 'Generates alternative routes and safety advice',
      criteria: ['Avoid high-risk zones', 'Use well-lit roads', 'Consider transport options'],
      output: 'Actionable safety recommendations'
    }
  };

  Object.entries(dataFlow).forEach(([step, details]) => {
    console.log(`${step.toUpperCase()}:`, details);
  });

  return dataFlow;
};

// ===== Usage Examples =====
export const usageExamples = {
  // Quick start
  basic: () => fetchVaranasiNews(),
  
  // Full analysis
  complete: () => completeWorkflowExample(),
  
  // City exploration
  exploreCities: () => demonstrateMultiCitySupport(),
  
  // API setup
  setupAPIs: () => setupRealNewsAPIs(),
  
  // Understanding the system
  learnFlow: () => explainDataFlow()
};

// Export for easy testing
export default {
  fetchVaranasiNews,
  analyzeRouteSafety,
  demonstrateMultiCitySupport,
  setupRealNewsAPIs,
  completeWorkflowExample,
  explainDataFlow,
  usageExamples
};

/*
🚀 HOW TO USE IN YOUR APP:

1. BASIC NEWS FETCHING:
   import { fetchVaranasiNews } from './utils/newsExamples';
   const news = await fetchVaranasiNews();

2. ROUTE SAFETY ANALYSIS:
   import { analyzeRouteSafety } from './utils/newsExamples';
   const safety = await analyzeRouteSafety(routeData, 'varanasi');

3. COMPLETE WORKFLOW:
   import { completeWorkflowExample } from './utils/newsExamples';
   const result = await completeWorkflowExample();

4. EXPLORE ALL CITIES:
   import { demonstrateMultiCitySupport } from './utils/newsExamples';
   const cities = demonstrateMultiCitySupport();

5. SETUP REAL APIs:
   import { setupRealNewsAPIs } from './utils/newsExamples';
   const instructions = setupRealNewsAPIs();
*/ 