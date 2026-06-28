const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["PORT", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://127.0.0.1:5500"
};
