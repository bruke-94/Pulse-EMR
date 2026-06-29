const pool = require("../config/db");

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}

async function createUser({ fullName, email, passwordHash, role }) {
  const result = await pool.query(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
    [fullName, email, passwordHash, role],
  );
  return findById(result.rows[0].id);
}

module.exports = { findByEmail, createUser, findById };
