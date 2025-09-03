const { body, query } = require('express-validator');

const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('emergency_contact')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Emergency contact must not be empty if provided')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateCrimeReport = [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('category')
    .isIn(['theft', 'assault', 'robbery', 'harassment', 'vandalism', 'burglary', 'violence', 'other'])
    .withMessage('Invalid crime category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('incident_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid incident date')
];

const validateRating = [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('safety_score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Safety score must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Comment must not exceed 300 characters'),
  body('route_type')
    .optional()
    .isIn(['walking', 'driving', 'cycling', 'public_transport'])
    .withMessage('Invalid route type')
];

const validateLocationQuery = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 0.001, max: 1 })
    .withMessage('Radius must be between 0.001 and 1 degrees')
];

const validateSOSAlert = [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Message must not exceed 200 characters')
];

const validateLocationShare = [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('duration')
    .optional()
    .isInt({ min: 5, max: 720 })
    .withMessage('Duration must be between 5 and 720 minutes')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateCrimeReport,
  validateRating,
  validateLocationQuery,
  validateSOSAlert,
  validateLocationShare
}; 