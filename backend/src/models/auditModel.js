const pool = require("../config/db");

async function createAudit({ userId, action, entityType, entityId, details }) {
  const result = await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      userId || null,
      action,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
    ],
  );
  return result.rows[0] || null;
}

module.exports = { createAudit };
