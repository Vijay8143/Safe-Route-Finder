const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const { sequelize, testConnection } = require('./config/database');
const { seedDatabase } = require('./seedDatabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Global state for demo mode
let isDemoMode = false;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Demo mode middleware
app.use((req, res, next) => {
  req.isDemoMode = isDemoMode;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/crime'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/sos', require('./routes/sos'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Safe Route Navigator API is running globally! 🌍',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: isDemoMode ? 'demo' : 'full',
    features: {
      globalCrimeData: true,
      routeSafety: true,
      locationServices: true,
      sosAlerts: true,
      liveTracking: true
    },
    coverage: 'Worldwide 🌎'
  });
});

// Global demo route
app.get('/api/demo-status', (req, res) => {
  res.json({
    success: true,
    demoMode: isDemoMode,
    message: isDemoMode ? 
      'Running in demo mode - all global features available!' : 
      'Running with full database - all features available!',
    globalFeatures: [
      'Crime data for any location worldwide',
      'Route safety analysis globally',
      'Country-specific safety ratings',
      'Local emergency numbers',
      'Cultural safety recommendations',
      'Real-time geolocation',
      'Multi-language ready'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: err.errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    mode: isDemoMode ? 'demo' : 'full'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    hint: 'Try /api/health for API status or /api/demo-status for features'
  });
});

// Initialize models in demo mode if needed
const initializeDemoMode = async () => {
  console.log('🚀 Initializing Demo Mode - Global features available!');
  isDemoMode = true;
  
  // Create mock models for demo mode with authentication
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  
  // Demo user data
  const demoUser = {
    id: 1,
    email: 'demo@saferoute.com',
    password_hash: await bcrypt.hash('Demo123!', 12),
    name: 'Demo User',
    phone: '+1234567890',
    emergency_contact: '+1987654321',
    is_active: true,
    validatePassword: async function(password) {
      return bcrypt.compare(password, this.password_hash);
    }
  };
  
  // Mock User model for demo mode
  global.User = { 
    findByPk: (id) => id === 1 ? demoUser : null,
    findOne: (options) => {
      if (options.where && options.where.email === 'demo@saferoute.com') {
        return demoUser;
      }
      return null;
    },
    create: (userData) => ({ 
      id: 2, 
      ...userData,
      validatePassword: async function(password) {
        return bcrypt.compare(password, this.password_hash);
      }
    })
  };
  
  global.Crime = { 
    findAll: () => [], 
    create: () => ({ id: 1, lat: 0, lng: 0 })
  };
  global.Rating = { 
    findAll: () => [], 
    create: () => ({ id: 1, safety_score: 5 })
  };
  
  console.log('✅ Demo mode initialized with authentication - Safe Route Navigator ready globally! 🌍');
  console.log('👤 Demo credentials: demo@saferoute.com / Demo123!');
  return true;
};

// Database sync and server start
const startServer = async () => {
  try {
    console.log('🌍 Starting Safe Route Navigator Global Server...');
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      console.log('🔄 Syncing database models...');
      // Try to load models only if database is connected
      try {
        const { User, Crime, Rating } = require('./models');
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Database models synchronized successfully.');
        
        // Seed database with demo data
        await seedDatabase();
        
        isDemoMode = false;
      } catch (modelError) {
        console.warn('⚠️ Model sync failed, switching to demo mode:', modelError.message);
        await initializeDemoMode();
      }
    } else {
      console.log('🎭 Database connection failed, starting in demo mode...');
      await initializeDemoMode();
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('=' .repeat(80));
      console.log('🚀 Safe Route Navigator API server running globally! 🌍');
      console.log('=' .repeat(80));
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Mode: ${isDemoMode ? 'Demo (No DB required)' : 'Full Database'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🎯 Demo status: http://localhost:${PORT}/api/demo-status`);
      console.log('');
      console.log('🔐 DEMO LOGIN CREDENTIALS:');
      console.log('  📧 Email: demo@saferoute.com');
      console.log('  🔑 Password: Demo123!');
      console.log('');
      console.log('🌍 GLOBAL FEATURES READY:');
      console.log('  ✅ Crime data for ANY location worldwide');
      console.log('  ✅ Route safety analysis globally');
      console.log('  ✅ Country-specific safety ratings');
      console.log('  ✅ Local emergency numbers detection');
      console.log('  ✅ Cultural safety recommendations');
      console.log('  ✅ Real-time geolocation services');
      console.log('  ✅ SOS and emergency features');
      console.log('');
      console.log('🎉 Ready to navigate safely ANYWHERE in the world!');
      console.log('=' .repeat(80));
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.log('🎭 Attempting emergency demo mode startup...');
    
    try {
      await initializeDemoMode();
      app.listen(PORT, () => {
        console.log('🆘 Emergency demo mode server started on port', PORT);
        console.log('🔐 Demo login: demo@saferoute.com / Demo123!');
      });
    } catch (emergencyError) {
      console.error('💥 Emergency startup failed:', emergencyError);
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (!isDemoMode && sequelize) {
    await sequelize.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (!isDemoMode && sequelize) {
    await sequelize.close();
  }
  process.exit(0);
});

startServer(); 