const express = require('express');
const { supabase, JWT_SECRET } = require('../server');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  // Only require and register strategy when credentials are present
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: profile.id, email: profile.emails?.[0]?.value, name: profile.displayName });
      if (error) return done(error);
      done(null, data?.[0] || profile);
    } catch (err) {
      done(err);
    }
  }));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:3000?token=${token}`);
  });
} else {
  // Graceful fallback endpoints if Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(501).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  });
  router.get('/google/callback', (req, res) => {
    res.status(501).send('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  });
}

// Register/Login with email/password
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, token: jwt.sign({ userId: data.user.id }, JWT_SECRET) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, token: jwt.sign({ userId: data.user.id }, JWT_SECRET) });
});

// Get user profile (protected)
router.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('profiles').select('*').eq('id', req.user.userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;