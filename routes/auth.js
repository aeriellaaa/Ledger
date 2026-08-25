const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { findByEmail, createUser, verifyPassword } = require('../models/user');

// TEMPORARY — move this to a real .env value in step 6, never commit a real secret
const JWT_SECRET = 'dev-secret-change-me';

function generateToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ errors: ['name, email, and password are all required'] });
  }

  const existing = findByEmail(email);
  if (existing) {
    return res.status(400).json({ errors: ['A user with that email already exists'] });
  }

  const user = createUser({ name, email, password });
  const token = generateToken(user);

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
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