const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");
const { appLogger } = require("./utils/logger");

async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(env.PORT, () => {
      appLogger.info("EMR API server started", { port: env.PORT });
    });
  } catch (error) {
    appLogger.error("Failed to start server", { message: error.message });
    process.exit(1);
  }
}

start();
