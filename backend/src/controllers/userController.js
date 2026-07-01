const pool = require("../config/db");

async function listDoctors(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email FROM users WHERE role = $1 ORDER BY full_name",
      ["doctor"],
    );
    return res.json({ data: result.rows });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listDoctors };
