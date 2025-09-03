const User = require('./User');
const Crime = require('./Crime');
const Rating = require('./Rating');

// Define associations
User.hasMany(Crime, { foreignKey: 'reported_by', as: 'reportedCrimes' });
Crime.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });

User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Crime,
  Rating
}; 