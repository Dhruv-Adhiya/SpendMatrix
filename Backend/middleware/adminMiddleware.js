const authMiddleware = require('./authMiddleware');

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  });
};

module.exports = adminMiddleware;
