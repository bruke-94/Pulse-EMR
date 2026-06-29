const pool = require("../config/db");

async function createEncounter({
  patientId,
  clinicianId,
  encounterDate,
  diagnosis,
  notes,
}) {
  const result = await pool.query(
    `INSERT INTO encounters (patient_id, clinician_id, encounter_date, diagnosis, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [patientId, clinicianId, encounterDate, diagnosis, notes],
  );

  const inserted = await pool.query(
    `SELECT e.id, e.patient_id, e.clinician_id, e.encounter_date, e.diagnosis, e.notes, e.created_at,
            p.first_name AS patient_first_name, p.last_name AS patient_last_name,
            u.full_name AS clinician_name
     FROM encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN users u ON u.id = e.clinician_id
     WHERE e.id = $1`,
    [result.rows[0].id],
  );

  return inserted.rows[0] || null;
}

async function getEncountersByPatientId(
  patientId,
  clinicianId = null,
  isAdmin = false,
) {
  let query = `SELECT e.id, e.patient_id, e.clinician_id, e.encounter_date, e.diagnosis, e.notes, e.created_at,
            u.full_name AS clinician_name
     FROM encounters e
     JOIN users u ON u.id = e.clinician_id
     WHERE e.patient_id = $1`;

  const params = [patientId];

  if (!isAdmin && clinicianId) {
    query += ` AND e.clinician_id = $2`;
    params.push(clinicianId);
  }

  query += ` ORDER BY e.encounter_date DESC`;

  const result = await pool.query(query, params);

  return result.rows;
}

module.exports = { createEncounter, getEncountersByPatientId };
