const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { getCrimeData, reportCrime, getCrimeStats, getRouteSafety } = require('../controllers/crimeController');
const { authenticateToken } = require('../middleware/auth');
const { validateCrimeReport, validateLocationQuery } = require('../middleware/validation');

// Public routes
router.get('/crime-data', validateLocationQuery, getCrimeData);
router.get('/stats', validateLocationQuery, getCrimeStats);

// Protected routes
router.post('/report', validateCrimeReport, authenticateToken, reportCrime);

// Analyze route safety
router.post('/route-safety', [
  body('waypoints').isArray({ min: 2 }).withMessage('At least 2 waypoints are required'),
  body('waypoints.*.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required for all waypoints'),
  body('waypoints.*.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required for all waypoints')
], getRouteSafety);

module.exports = router; 