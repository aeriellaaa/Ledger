const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const supabase = require('../models/supabaseClient');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { errors: ['Too many attempts, please try again later'] }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name) errors.push('name is required');
  if (!email || !EMAIL_REGEX.test(email)) errors.push('a valid email is required');
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) {
    return res.status(400).json({ errors: [error.message] });
  }

  res.status(201).json({
    token: data.session ? data.session.access_token : null,
    user: { id: data.user.id, name, email: data.user.email }
  });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errors: ['email and password are required'] });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ errors: ['Invalid email or password'] });
  }

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      name: data.user.user_metadata.name,
      email: data.user.email
    }
  });
});

module.exports = router;