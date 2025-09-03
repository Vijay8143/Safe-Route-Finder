const express = require('express');
const router = express.Router();

const { sendSOSAlert, shareLocation, getLiveLocation, updateLiveLocation } = require('../controllers/sosController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateSOSAlert, validateLocationShare } = require('../middleware/validation');

// Protected routes (require authentication for SOS features)
router.post('/alert', validateSOSAlert, authenticateToken, sendSOSAlert);
router.post('/share-location', validateLocationShare, authenticateToken, shareLocation);

// Public routes for live location viewing
router.get('/live-location/:shareId', getLiveLocation);
router.put('/live-location/:shareId', validateLocationShare, optionalAuth, updateLiveLocation);

module.exports = router; 