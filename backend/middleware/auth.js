const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Prefer cookie, fall back to Authorization header
  const token = req.cookies?.token || (() => {
    const h = req.headers.authorization;
    return h?.startsWith('Bearer ') ? h.split(' ')[1] : null;
  })();

  if (!token) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
  }
}

module.exports = authMiddleware;
