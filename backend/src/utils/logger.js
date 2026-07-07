const morgan = require("morgan");

const requestLogger = morgan("combined");

const appLogger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({ level: "info", message, data, at: new Date().toISOString() }));
  },
  error: (message, data = {}) => {
    console.error(JSON.stringify({ level: "error", message, data, at: new Date().toISOString() }));
  }
};

module.exports = { requestLogger, appLogger };
