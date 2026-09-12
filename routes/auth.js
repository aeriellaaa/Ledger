const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { findByEmail, createUser, verifyPassword } = require('../models/user');

// TEMPORARY — move this to a real .env value in step 6, never commit a real secret
const JWT_SECRET = 'dev-secret-change-me';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per window
  message: { errors: ['Too many attempts, please try again later'] }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function generateToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', authLimiter, (req, res) => {
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

  const existing = findByEmail(email);
  if (existing) {
    return res.status(400).json({ errors: ['A user with that email already exists'] });
  }

  const user = createUser({ name, email, password });
  const token = generateToken(user);

  res.status(201).json({ token, user });
});

router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errors: ['email and password are required'] });
  }

  const user = findByEmail(email);
  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ errors: ['Invalid email or password'] });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;