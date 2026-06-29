const pool = require("../config/db");

async function createVitalSigns({
  encounterId,
  temperatureC,
  pulseBpm,
  respiratoryRate,
  systolicBp,
  diastolicBp,
  spo2Percent,
  recordedAt,
}) {
  const result = await pool.query(
    `INSERT INTO vital_signs (encounter_id, temperature_c, pulse_bpm, respiratory_rate, systolic_bp, diastolic_bp, spo2_percent, recorded_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      encounterId,
      temperatureC,
      pulseBpm,
      respiratoryRate,
      systolicBp,
      diastolicBp,
      spo2Percent,
      recordedAt,
    ],
  );

  const inserted = await pool.query(
    `SELECT v.id, v.encounter_id, v.temperature_c, v.pulse_bpm, v.respiratory_rate, v.systolic_bp, v.diastolic_bp, v.spo2_percent, v.recorded_at,
            e.patient_id, e.clinician_id
     FROM vital_signs v
     JOIN encounters e ON e.id = v.encounter_id
     WHERE v.id = $1`,
    [result.rows[0].id],
  );

  return inserted.rows[0] || null;
}

async function getVitalSignsByEncounterId(encounterId) {
  const result = await pool.query(
    `SELECT id, encounter_id, temperature_c, pulse_bpm, respiratory_rate, systolic_bp, diastolic_bp, spo2_percent, recorded_at
     FROM vital_signs
     WHERE encounter_id = $1
     ORDER BY recorded_at DESC, id DESC`,
    [encounterId],
  );

  return result.rows;
}

module.exports = { createVitalSigns, getVitalSignsByEncounterId };
