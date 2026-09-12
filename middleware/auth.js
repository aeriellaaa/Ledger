const supabase = require('../models/supabaseClient');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ['Missing or invalid Authorization header'] });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ errors: ['Invalid or expired token'] });
  }

  req.userId = data.user.id;
  next();
}

module.exports = authMiddleware;