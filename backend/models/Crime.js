const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Crime = sequelize.define('Crime', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  category: {
    type: DataTypes.ENUM(
      'theft',
      'assault',
      'robbery',
      'harassment',
      'vandalism',
      'burglary',
      'violence',
      'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  incident_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'crimes',
  timestamps: true,
  indexes: [
    {
      fields: ['lat', 'lng']
    },
    {
      fields: ['category']
    },
    {
      fields: ['incident_date']
    }
  ]
});

module.exports = Crime; 