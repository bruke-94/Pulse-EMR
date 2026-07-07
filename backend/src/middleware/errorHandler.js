const { appLogger } = require("../utils/logger");

function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  appLogger.error("Unhandled error", { message: err.message, stack: err.stack });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
