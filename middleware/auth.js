const jwt = require('jsonwebtoken');

const JWT_SECRET = 'dev-secret-change-me';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ['Missing or invalid Authorization header'] });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ errors: ['Invalid or expired token'] });
  }
}

module.exports = authMiddleware;