// Assumes your /api/auth login issues a JWT signed with JWT_SECRET
// containing { id: <user _id> }. Adjust to match your auth.js.
// npm i jsonwebtoken
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};