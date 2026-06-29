const pool = require("../config/db");

async function createAppointment({
  patientId,
  doctorId,
  appointmentDate,
  reason,
  status,
}) {
  const result = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [patientId, doctorId, appointmentDate, reason, status || "scheduled"],
  );

  const inserted = await pool.query(
    "SELECT * FROM appointments WHERE id = $1",
    [result.rows[0].id],
  );
  return inserted.rows[0] || null;
}

async function getAppointments() {
  const result = await pool.query(
    `SELECT a.id, a.appointment_date, a.reason, a.status,
            p.first_name AS patient_first_name, p.last_name AS patient_last_name,
            u.full_name AS doctor_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN users u ON u.id = a.doctor_id
     ORDER BY a.appointment_date DESC`,
  );
  return result.rows;
}

module.exports = { createAppointment, getAppointments };
