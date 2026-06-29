const pool = require("../config/db");

async function createPrescription({
  encounterId,
  medicationName,
  dosage,
  frequency,
  durationDays,
  instructions,
}) {
  const result = await pool.query(
    `INSERT INTO prescriptions (encounter_id, medication_name, dosage, frequency, duration_days, instructions)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      encounterId,
      medicationName,
      dosage,
      frequency,
      durationDays,
      instructions,
    ],
  );

  const inserted = await pool.query(
    `SELECT p.id, p.encounter_id, p.medication_name, p.dosage, p.frequency, p.duration_days, p.instructions, p.created_at,
            e.patient_id, e.clinician_id
     FROM prescriptions p
     JOIN encounters e ON e.id = p.encounter_id
     WHERE p.id = $1`,
    [result.rows[0].id],
  );

  return inserted.rows[0] || null;
}

async function getPrescriptionsByEncounterId(encounterId) {
  const result = await pool.query(
    `SELECT id, encounter_id, medication_name, dosage, frequency, duration_days, instructions, created_at
     FROM prescriptions
     WHERE encounter_id = $1
     ORDER BY created_at DESC, id DESC`,
    [encounterId],
  );

  return result.rows;
}

module.exports = { createPrescription, getPrescriptionsByEncounterId };
