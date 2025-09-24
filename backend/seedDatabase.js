const { sequelize, testConnection } = require('./config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection first
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('❌ Database not connected, skipping seeding');
      return false;
    }

    // Import models
    const { User, Crime, Rating } = require('./models');
    
    // Force sync database tables (recreate if needed in development)
    console.log('📊 Syncing database tables...');
    await sequelize.sync({ force: false, alter: true });
    
    // Delete existing demo user if it exists to recreate it
    console.log('🔍 Checking for existing demo user...');
    await User.destroy({ where: { email: 'demo@saferoute.com' } });
    
    // Create demo user with consistent hashing
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('Demo123!', 12);
    const demoUser = await User.create({
      email: 'demo@saferoute.com',
      password_hash: hashedPassword,
      name: 'Demo User',
      phone: '+1234567890',
      emergency_contact: '+1987654321',
      is_active: true
    });
    
    console.log('✅ Demo user created successfully');
    console.log('📧 Email: demo@saferoute.com');
    console.log('🔑 Password: Demo123!');
    console.log(`🆔 User ID: ${demoUser.id}`);
    
    // Verify the user can be found and password validated
    const foundUser = await User.findOne({ where: { email: 'demo@saferoute.com' } });
    if (foundUser) {
      const isValidPassword = await foundUser.validatePassword('Demo123!');
      console.log(`🔐 Password validation test: ${isValidPassword ? 'PASSED' : 'FAILED'}`);
    }
    
    // Create some sample crime data for NYC (default location)
    const existingCrimes = await Crime.findAll({ limit: 1 });
    if (existingCrimes.length === 0) {
      console.log('🚨 Creating sample crime data...');
      
      const sampleCrimes = [
        {
          lat: 40.7128,
          lng: -74.0060,
          type: 'theft',
          category: 'theft',
          severity: 'medium',
          description: 'Sample theft incident in downtown area',
          date_occurred: new Date(),
          incident_date: new Date(),
          source: 'demo'
        },
        {
          lat: 40.7589,
          lng: -73.9851,
          type: 'assault',
          category: 'assault',
          severity: 'high',
          description: 'Sample assault incident near Central Park',
          date_occurred: new Date(),
          incident_date: new Date(),
          source: 'demo'
        },
        {
          lat: 40.7505,
          lng: -73.9934,
          type: 'robbery',
          category: 'robbery',
          severity: 'high',
          description: 'Sample robbery incident in Times Square area',
          date_occurred: new Date(),
          incident_date: new Date(),
          source: 'demo'
        },
        {
          lat: 40.7831,
          lng: -73.9712,
          type: 'harassment',
          category: 'harassment',
          severity: 'medium',
          description: 'Sample harassment incident on Upper East Side',
          date_occurred: new Date(),
          incident_date: new Date(),
          source: 'demo'
        },
        {
          lat: 40.7282,
          lng: -73.7949,
          type: 'vandalism',
          category: 'vandalism',
          severity: 'low',
          description: 'Sample vandalism incident in Queens',
          date_occurred: new Date(),
          incident_date: new Date(),
          source: 'demo'
        }
      ];
      
      await Crime.bulkCreate(sampleCrimes);
      console.log(`✅ Created ${sampleCrimes.length} sample crime records`);
    }
    
    // Create sample ratings
    const existingRatings = await Rating.findAll({ limit: 1 });
    if (existingRatings.length === 0) {
      console.log('⭐ Creating sample safety ratings...');
      
      const sampleRatings = [
        {
          lat: 40.7128,
          lng: -74.0060,
          safety_score: 4,
          time_of_day: 'morning',
          comment: 'Generally safe during daytime with good foot traffic',
          user_id: demoUser.id
        },
        {
          lat: 40.7589,
          lng: -73.9851,
          safety_score: 3,
          time_of_day: 'night',
          comment: 'Be cautious at night, limited lighting',
          user_id: demoUser.id
        },
        {
          lat: 40.7505,
          lng: -73.9934,
          safety_score: 5,
          time_of_day: 'afternoon',
          comment: 'Busy area with good security presence',
          user_id: demoUser.id
        }
      ];
      
      await Rating.bulkCreate(sampleRatings);
      console.log(`✅ Created ${sampleRatings.length} sample safety ratings`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('==========================================');
    console.log('Demo credentials ready for testing:');
    console.log('📧 Email: demo@saferoute.com');
    console.log('🔑 Password: Demo123!');
    console.log('==========================================');
    return true;
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error('Full error details:', error.stack);
    return false;
  }
};

module.exports = { seedDatabase };