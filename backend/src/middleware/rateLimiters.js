const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
  handler(req, res, next, options) {
    return res.status(options.statusCode).json(options.message);
  },
});

module.exports = { loginLimiter };