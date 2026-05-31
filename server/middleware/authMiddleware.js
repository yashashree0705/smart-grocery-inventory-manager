const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'Access Denied. Authorization header missing.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Access Denied. Token layout missing.' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Authentication token is invalid or expired.' });
  }
};
