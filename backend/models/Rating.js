const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  safety_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  time_of_day: {
    type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'night'),
    allowNull: false
  },
  day_of_week: {
    type: DataTypes.ENUM(
      'monday', 'tuesday', 'wednesday', 'thursday', 
      'friday', 'saturday', 'sunday'
    ),
    allowNull: false
  },
  route_type: {
    type: DataTypes.ENUM('walking', 'driving', 'cycling', 'public_transport'),
    defaultValue: 'walking'
  },
  helpful_votes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'ratings',
  timestamps: true,
  indexes: [
    {
      fields: ['lat', 'lng']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['safety_score']
    },
    {
      fields: ['time_of_day']
    }
  ]
});

module.exports = Rating; 