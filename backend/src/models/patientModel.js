const pool = require("../config/db");

async function getAllPatients() {
  const result = await pool.query(
    `SELECT id, mrn, first_name, last_name, date_of_birth, sex, phone, address, created_at
     FROM patients ORDER BY id DESC`,
  );
  return result.rows;
}

async function getPatientById(id) {
  const result = await pool.query(
    `SELECT id, mrn, first_name, last_name, date_of_birth, sex, phone, address, created_at
     FROM patients WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function createPatient({
  mrn,
  firstName,
  lastName,
  dateOfBirth,
  sex,
  phone,
  address,
}) {
  const result = await pool.query(
    `INSERT INTO patients (mrn, first_name, last_name, date_of_birth, sex, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [mrn, firstName, lastName, dateOfBirth, sex, phone, address],
  );
  return getPatientById(result.rows[0].id);
}

module.exports = { getAllPatients, getPatientById, createPatient };
