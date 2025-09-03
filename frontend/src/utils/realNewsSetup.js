// Complete Guide for Setting Up Real News APIs

import newsService from '../services/newsService';

// ===== STEP-BY-STEP SETUP GUIDE =====
export const setupGuide = {
  step1: {
    title: "📝 Get NewsAPI Key (Free)",
    url: "https://newsapi.org/",
    instructions: [
      "1. Go to https://newsapi.org/",
      "2. Click 'Get API Key'",
      "3. Create free account (no credit card needed)",
      "4. Copy your API key",
      "5. Free tier: 100 requests/day"
    ],
    envVar: "REACT_APP_NEWS_API_KEY"
  },
  
  step2: {
    title: "📰 Get GNews Key (Free)",
    url: "https://gnews.io/",
    instructions: [
      "1. Go to https://gnews.io/",
      "2. Click 'Get API Key'",
      "3. Sign up for free account",
      "4. Copy your API key",
      "5. Free tier: 100 requests/day"
    ],
    envVar: "REACT_APP_GNEWS_API_KEY"
  },
  
  step3: {
    title: "🗞️ Get TheNewsAPI Key (Free)",
    url: "https://www.thenewsapi.com/",
    instructions: [
      "1. Go to https://www.thenewsapi.com/",
      "2. Click 'Get Started Free'",
      "3. Create account",
      "4. Copy your API key",
      "5. Free tier: 150 requests/day"
    ],
    envVar: "REACT_APP_THENEWS_API_KEY"
  },
  
  step4: {
    title: "⚙️ Setup Environment File",
    instructions: [
      "1. Create .env file in frontend folder:",
      "   DoubtSolver/frontend/.env",
      "2. Add your API keys:",
      "   REACT_APP_NEWS_API_KEY=your_key_here",
      "   REACT_APP_GNEWS_API_KEY=your_key_here", 
      "   REACT_APP_THENEWS_API_KEY=your_key_here",
      "3. Restart your React server:",
      "   npm start"
    ]
  }
};

// ===== TEST FUNCTIONS =====

// Test if API keys are configured
export const testAPIKeys = () => {
  const results = {
    newsapi: !!process.env.REACT_APP_NEWS_API_KEY && process.env.REACT_APP_NEWS_API_KEY !== 'demo_key',
    gnews: !!process.env.REACT_APP_GNEWS_API_KEY && process.env.REACT_APP_GNEWS_API_KEY !== 'demo_key',
    thenews: !!process.env.REACT_APP_THENEWS_API_KEY && process.env.REACT_APP_THENEWS_API_KEY !== 'demo_key'
  };
  
  console.log('🔑 API Key Status:', results);
  
  const configuredCount = Object.values(results).filter(Boolean).length;
  console.log(`✅ ${configuredCount}/3 APIs configured`);
  
  if (configuredCount === 0) {
    console.log('❌ No real API keys found - using mock data');
    console.log('📖 See setupGuide for instructions');
  } else if (configuredCount < 3) {
    console.log('⚠️ Some APIs missing - limited news coverage');
  } else {
    console.log('🎉 All APIs configured - full news coverage available!');
  }
  
  return results;
};

// Test real news fetching
export const testRealNews = async (cityName = 'varanasi') => {
  console.log(`🔍 Testing real news for ${cityName}...`);
  
  try {
    const startTime = Date.now();
    const newsData = await newsService.fetchCityNews(cityName, {
      pageSize: 10,
      sources: ['newsapi', 'gnews', 'thenews']
    });
    const endTime = Date.now();
    
    console.log('📊 Test Results:', {
      city: newsData.city,
      totalArticles: newsData.totalArticles,
      safetyArticles: newsData.safetyArticles,
      sources: newsData.sources,
      errors: newsData.errors,
      responseTime: `${endTime - startTime}ms`,
      isMockData: newsData.isMockData || false
    });
    
    if (newsData.isMockData) {
      console.log('⚠️ Using mock data - set up real API keys for live news');
    } else {
      console.log('✅ Real news data retrieved successfully!');
      
      // Show sample articles
      if (newsData.news && newsData.news.length > 0) {
        console.log('📰 Sample Articles:');
        newsData.news.slice(0, 3).forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Severity: ${article.severity} | Score: ${article.safetyScore}`);
          console.log(`   Source: ${article.source} | Time: ${new Date(article.publishedAt).toLocaleString()}`);
        });
      }
    }
    
    return newsData;
  } catch (error) {
    console.error('❌ News test failed:', error);
    return null;
  }
};

// Test location detection
export const testLocationDetection = () => {
  console.log('📍 Testing location detection...');
  
  if (!navigator.geolocation) {
    console.log('❌ Geolocation not supported');
    return false;
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('⏰ Location detection timed out');
      resolve(false);
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        console.log('✅ Location detected:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve(true);
      },
      (error) => {
        clearTimeout(timeout);
        console.log('❌ Location detection failed:', error.message);
        resolve(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};

// Complete system test
export const runCompleteTest = async () => {
  console.log('🚀 Running Complete System Test...');
  console.log('================================');
  
  // Test 1: API Keys
  console.log('\n1️⃣ Testing API Configuration...');
  const apiStatus = testAPIKeys();
  
  // Test 2: Location Detection
  console.log('\n2️⃣ Testing Location Detection...');
  const locationWorking = await testLocationDetection();
  
  // Test 3: News Fetching
  console.log('\n3️⃣ Testing News Fetching...');
  const newsData = await testRealNews('varanasi');
  
  // Test 4: City Support
  console.log('\n4️⃣ Testing Multi-City Support...');
  const cities = newsService.getSupportedCities();
  console.log(`✅ ${cities.length} cities supported`);
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`API Keys: ${Object.values(apiStatus).filter(Boolean).length}/3 configured`);
  console.log(`Location: ${locationWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`News: ${newsData ? '✅ Working' : '❌ Failed'}`);
  console.log(`Cities: ✅ ${cities.length} available`);
  
  const overallScore = [
    Object.values(apiStatus).some(Boolean),
    locationWorking,
    !!newsData,
    cities.length > 0
  ].filter(Boolean).length;
  
  console.log(`\n🎯 Overall Score: ${overallScore}/4`);
  
  if (overallScore === 4) {
    console.log('🎉 Perfect! All systems working with real data');
  } else if (overallScore >= 2) {
    console.log('⚠️ Partially working - some features using mock data');
  } else {
    console.log('❌ Multiple issues - mostly using mock data');
  }
  
  return {
    apiKeys: apiStatus,
    location: locationWorking,
    news: !!newsData,
    cities: cities.length,
    score: overallScore
  };
};

// ===== QUICK SETUP COMMANDS =====
export const quickSetupCommands = {
  // Create .env file with placeholders
  createEnvFile: () => {
    const envContent = `# Safe Route Navigator - News API Configuration
# Get free API keys from the URLs in the setup guide

# NewsAPI (https://newsapi.org/) - 100 requests/day free
REACT_APP_NEWS_API_KEY=your_newsapi_key_here

# GNews (https://gnews.io/) - 100 requests/day free  
REACT_APP_GNEWS_API_KEY=your_gnews_key_here

# TheNewsAPI (https://www.thenewsapi.com/) - 150 requests/day free
REACT_APP_THENEWS_API_KEY=your_thenews_key_here

# Optional: Map APIs
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
`;
    
    console.log('📄 Copy this content to DoubtSolver/frontend/.env:');
    console.log('==================================================');
    console.log(envContent);
    
    return envContent;
  },

  // Show npm commands
  showCommands: () => {
    console.log('🛠️ Setup Commands:');
    console.log('==================');
    console.log('cd DoubtSolver/frontend');
    console.log('touch .env  # Create environment file');
    console.log('# Add your API keys to .env file');
    console.log('npm start  # Restart server to load new keys');
  }
};

// ===== EXPORT ALL UTILITIES =====
export default {
  setupGuide,
  testAPIKeys,
  testRealNews,
  testLocationDetection,
  runCompleteTest,
  quickSetupCommands
};

/*
🚀 QUICK START INSTRUCTIONS:

1. RUN SYSTEM TEST:
   import { runCompleteTest } from './utils/realNewsSetup';
   await runCompleteTest();

2. GET API KEYS:
   import { setupGuide } from './utils/realNewsSetup';
   console.log(setupGuide);

3. CREATE ENV FILE:
   import { quickSetupCommands } from './utils/realNewsSetup';
   quickSetupCommands.createEnvFile();

4. TEST INDIVIDUAL FEATURES:
   import { testRealNews, testLocationDetection } from './utils/realNewsSetup';
   await testRealNews('varanasi');
   await testLocationDetection();
*/ 