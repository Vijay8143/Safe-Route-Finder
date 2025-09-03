import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiMap, 
  FiUsers, 
  FiAlertCircle, 
  FiStar, 
  FiNavigation,
  FiHeart,
  FiPhone,
  FiEye,
  FiClock
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiMap className="w-8 h-8" />,
      title: "Smart Route Planning",
      description: "Get the safest routes based on real-time crime data and community insights.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Community Safety Ratings",
      description: "Rate and view safety scores from other users in your community.",
      color: "bg-gradient-to-br from-teal-500 to-teal-600"
    },
    {
      icon: <FiAlertCircle className="w-8 h-8" />,
      title: "SOS Emergency System",
      description: "Instant emergency alerts with location sharing to your trusted contacts.",
      color: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      icon: <FiEye className="w-8 h-8" />,
      title: "Crime Data Visualization",
      description: "See nearby incidents and avoid high-risk areas with interactive maps.",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Night Mode Detection",
      description: "Enhanced safety features automatically activate during nighttime hours.",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Live Location Sharing",
      description: "Share your real-time location with friends and family for peace of mind.",
      color: "bg-gradient-to-br from-pink-500 to-pink-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Users Protected", icon: <FiShield /> },
    { number: "50,000+", label: "Safe Routes", icon: <FiNavigation /> },
    { number: "25,000+", label: "Community Ratings", icon: <FiStar /> },
    { number: "99.9%", label: "Uptime", icon: <FiPhone /> }
  ];

  return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent">
                Safe Route Navigator
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/map" className="btn-primary">
                  Open App
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-outline">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-teal-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Your Safety,
              <span className="bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent">
                {" "}Our Priority
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Navigate with confidence using AI-powered safety insights, real-time crime data, 
              and community-driven route recommendations designed for personal safety.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    Start Your Safe Journey
                  </Link>
                  <Link to="/login" className="btn-outline text-lg px-8 py-4 hover:shadow-lg transition-all duration-300">
                    Sign In to Continue
                  </Link>
                </>
              ) : (
                <Link to="/map" className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Open Safe Route Navigator
                </Link>
              )}
            </div>

            {/* Demo Credentials */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto border border-gray-200 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Try the Demo</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> demo@saferoute.com</p>
                <p><strong>Password:</strong> Demo123!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Safety Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed with personal safety in mind, combining cutting-edge technology 
              with community insights to keep you protected.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to safer navigation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Set Your Destination",
                description: "Enter where you want to go and we'll analyze the safest routes based on real-time data."
              },
              {
                step: "02", 
                title: "Get Smart Recommendations",
                description: "Our AI considers crime data, community ratings, lighting, and time of day to suggest the best route."
              },
              {
                step: "03",
                title: "Navigate Safely",
                description: "Follow your optimized route with emergency features enabled and share your location with trusted contacts."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-primary-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Feel Safer?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Join thousands of users who trust Safe Route Navigator for their daily journeys. 
            Your safety is our mission.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Get Started Now
              </Link>
              <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-4 rounded-lg transition-all duration-300">
                Sign In
              </Link>
            </div>
          ) : (
            <Link to="/map" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-block">
              Open App
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Safe Route Navigator</span>
            </div>
            
            <div className="text-center md:text-right">
                          <p className="text-gray-400 mb-2">Empowering users with technology for safer journeys</p>
            <p className="text-sm text-gray-500">© 2024 Safe Route Navigator. Built for personal safety.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 