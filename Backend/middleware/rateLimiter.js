const rateLimit = require('express-rate-limit');

const rateLimitResponse = (req, res) => {
  res.status(429).json({
    status: 'error',
    message: 'Too many requests, please try again later',
  });
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  skip: (req) => req.path === '/',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

module.exports = { globalLimiter, authLimiter, adminLimiter };
