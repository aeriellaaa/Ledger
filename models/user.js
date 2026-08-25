const bcrypt = require('bcrypt');
const db = require('./db');

const SALT_ROUNDS = 10;

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function createUser({ name, email, password }) {
  const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);
  const id = Date.now().toString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (@id, @name, @email, @password_hash)
  `).run({ id, name, email, password_hash });

  return { id, name, email };
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

module.exports = { findByEmail, createUser, verifyPassword };