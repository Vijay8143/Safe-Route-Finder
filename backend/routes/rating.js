const express = require('express');
const router = express.Router();

const { rateRoute, getSafetyHeatmap, getLocationRatings } = require('../controllers/ratingController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateRating, validateLocationQuery } = require('../middleware/validation');

// Public routes (with optional authentication)
router.get('/heatmap', validateLocationQuery, optionalAuth, getSafetyHeatmap);
router.get('/location', validateLocationQuery, optionalAuth, getLocationRatings);

// Protected routes
router.post('/rate-route', validateRating, authenticateToken, rateRoute);

module.exports = router; 