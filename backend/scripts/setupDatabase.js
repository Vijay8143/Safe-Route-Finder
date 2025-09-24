const { sequelize, testConnection } = require('../config/database');
const { User, Crime, Rating } = require('../models');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    // Test connection
    await testConnection();
    
    // Force sync (recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully.');
    
    // Sample data for testing
    console.log('📊 Inserting sample data...');
    
    // Sample user
    const hashed = await bcrypt.hash('Demo123!', 12);
    const sampleUser = await User.create({
      email: 'demo@saferoute.com',
      password_hash: hashed,
      name: 'Demo User',
      phone: '+1234567890',
      emergency_contact: 'emergency@saferoute.com'
    });
    
    // Sample crime data (around New York City)
    const sampleCrimes = [
      {
        lat: 40.7589,
        lng: -73.9851,
        category: 'theft',
        description: 'Purse snatching incident reported near Times Square',
        severity: 'medium',
        incident_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        reported_by: sampleUser.id
      },
      {
        lat: 40.7505,
        lng: -73.9934,
        category: 'harassment',
        description: 'Verbal harassment reported on subway platform',
        severity: 'low',
        incident_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        reported_by: sampleUser.id
      },
      {
        lat: 40.7614,
        lng: -73.9776,
        category: 'assault',
        description: 'Physical altercation in Central Park area',
        severity: 'high',
        incident_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        reported_by: sampleUser.id
      },
      {
        lat: 40.7282,
        lng: -74.0776,
        category: 'robbery',
        description: 'Armed robbery near financial district',
        severity: 'critical',
        incident_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        reported_by: sampleUser.id
      }
    ];
    
    await Crime.bulkCreate(sampleCrimes);
    
    // Sample safety ratings
    const sampleRatings = [
      {
        user_id: sampleUser.id,
        lat: 40.7589,
        lng: -73.9851,
        safety_score: 3,
        comment: 'Busy area during day, feels safe but crowded',
        time_of_day: 'afternoon',
        day_of_week: 'wednesday',
        route_type: 'walking'
      },
      {
        user_id: sampleUser.id,
        lat: 40.7614,
        lng: -73.9776,
        safety_score: 4,
        comment: 'Central Park is well-lit and patrolled',
        time_of_day: 'morning',
        day_of_week: 'saturday',
        route_type: 'walking'
      },
      {
        user_id: sampleUser.id,
        lat: 40.7505,
        lng: -73.9934,
        safety_score: 2,
        comment: 'Subway station feels unsafe at night',
        time_of_day: 'night',
        day_of_week: 'friday',
        route_type: 'walking'
      }
    ];
    
    await Rating.bulkCreate(sampleRatings);
    
    console.log('✅ Sample data inserted successfully.');
    console.log(`👤 Demo user created: demo@saferoute.com / Demo123!`);
    console.log(`🗃️  ${sampleCrimes.length} sample crimes added`);
    console.log(`⭐ ${sampleRatings.length} sample ratings added`);
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

setupDatabase();