const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

// Determine database dialect and configuration
const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'sqlite') {
  // SQLite configuration - no setup required!
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_NAME || './safe_route_navigator.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    }
  });
} else {
  // MySQL configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'safe_route_navigator',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true
      }
    }
  );
}

// Test the connection with fallback
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${dialect.toUpperCase()}).`);
    return true;
  } catch (error) {
    console.error(`❌ Unable to connect to the database (${dialect}):`, error.message);
    
    // If MySQL fails, try SQLite fallback
    if (dialect === 'mysql') {
      console.log('🔄 Attempting SQLite fallback...');
      try {
        sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: './safe_route_navigator_fallback.sqlite',
          logging: false
        });
        await sequelize.authenticate();
        console.log('✅ SQLite fallback connection successful!');
        return true;
      } catch (fallbackError) {
        console.error('❌ SQLite fallback also failed:', fallbackError.message);
      }
    }
    
    return false;
  }
};

module.exports = { sequelize, testConnection }; 