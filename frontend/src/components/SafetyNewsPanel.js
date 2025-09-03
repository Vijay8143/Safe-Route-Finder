import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiClock, FiMapPin, FiExternalLink, FiRefreshCw, FiShield, FiInfo } from 'react-icons/fi';
import newsService from '../services/newsService';
import { useTheme } from '../context/ThemeContext';

const SafetyNewsPanel = ({ currentCity = 'varanasi', onLocationAlert }) => {
  const { theme } = useTheme();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchNews = async (cityName, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Fetching safety news for ${cityName}... (refresh #${refreshCount + 1})`);
      
      // Clear cache if force refresh
      if (forceRefresh) {
        newsService.newsCache.clear();
      }
      
      const data = await newsService.fetchCityNews(cityName, {
        pageSize: 20,
        sources: ['newsapi', 'gnews'], // Try multiple sources
        forceReal: false // Allow fallback to enhanced mock data
      });
      
      setNewsData(data);
      setLastUpdated(new Date());
      setRefreshCount(prev => prev + 1);
      
      // Alert parent component about high-risk locations
      if (onLocationAlert && data.news) {
        const criticalIncidents = data.news.filter(article => 
          article.severity === 'critical' || article.severity === 'high'
        );
        
        if (criticalIncidents.length > 0) {
          onLocationAlert(criticalIncidents);
        }
      }
      
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCity) {
      fetchNews(currentCity);
    }
  }, [currentCity]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700';
      default: return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
          case 'critical': return '!';
    case 'high': return '!';
              case 'medium': return '!';
        default: return 'i';
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor((now - articleDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleRefresh = () => {
    if (currentCity) {
      fetchNews(currentCity, true); // Force refresh
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <FiShield className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-500" />
            Safety News
          </h3>
          <div className="animate-spin">
            <FiRefreshCw className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-red-200 dark:border-red-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-red-900 dark:text-red-200 flex items-center">
            <FiAlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Safety News - Error
          </h3>
          <button 
            onClick={handleRefresh}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!newsData) {
    return null;
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      {      /* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <FiShield className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-500" />
            Safety News - {newsData.city.charAt(0).toUpperCase() + newsData.city.slice(1)}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
            <FiClock className="w-3 h-3 mr-1" />
            {lastUpdated ? `Updated ${getTimeAgo(lastUpdated.toISOString())}` : 'Loading...'}
            {newsData.isMockData && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/50 dark:text-orange-300 flex items-center">
                <FiInfo className="w-3 h-3 mr-1" />
                Cached alerts (real news blocked by browser)
              </span>
            )}
            <span className="ml-2 px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded dark:bg-gray-700 dark:text-gray-300">
              #{refreshCount}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100">{newsData.safetyArticles}</div>
            <div className="text-gray-500 dark:text-gray-400">alerts</div>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
            title="Generate new alerts"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Safety Summary */}
      {newsData.news && newsData.news.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg ${newsData.isMockData ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${newsData.isMockData ? 'text-orange-800 dark:text-orange-300' : 'text-teal-800 dark:text-teal-300'}`}>
              {newsData.isMockData ? (
                <>
                  <strong>📰 Could not fetch latest news. Using cached alerts.</strong><br />
                  <span className="text-xs">Displaying {newsData.safetyArticles} recent safety alerts for your area. Click refresh for new alerts.</span>
                </>
              ) : (
                <><strong>Safety Summary:</strong> {newsData.safetyArticles} incidents reported in the last 7 days</>
              )}
            </div>
            <div className="flex space-x-1">
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const count = newsData.news.filter(article => article.severity === severity).length;
                return count > 0 ? (
                  <span key={severity} className="text-xs px-2 py-1 rounded-full bg-white/60 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
                    {getSeverityIcon(severity)} {count}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* News Articles */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {newsData.news && newsData.news.length > 0 ? (
          newsData.news.slice(0, 10).map((article) => (
            <div 
              key={article.id} 
              className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${getSeverityColor(article.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getSeverityIcon(article.severity)}</span>
                    <span className="text-xs px-2 py-1 bg-white/60 dark:bg-gray-700/50 rounded-full font-medium text-gray-700 dark:text-gray-200">
                      {article.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                    {article.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        {article.distance ? `${article.distance.toFixed(1)}km away` : 'Location unknown'}
                      </span>
                      <span>Source: {article.source}</span>
                    </div>
                    
                    {article.url && article.url !== '#mock-news-1' && article.url !== '#mock-news-2' && (
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-xs"
                      >
                        Read more <FiExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>

                  {/* Locations */}
                  {article.locations && article.locations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {article.locations.slice(0, 3).map((location, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center text-xs px-2 py-1 bg-white/50 dark:bg-gray-700/50 rounded-full text-gray-600 dark:text-gray-300"
                        >
                          {location.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiShield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No recent safety incidents reported</p>
            <p className="text-xs text-gray-400 mt-1">This is good news for your area!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {newsData.sources && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Sources: {Array.isArray(newsData.sources) ? newsData.sources.join(', ') : newsData.sources}
              {newsData.isMockData && ' (simulated for demo)'}
            </span>
            <span>
              Last updated: {new Date(newsData.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyNewsPanel; 