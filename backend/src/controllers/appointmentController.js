const Joi = require("joi");
const Appointment = require("../models/appointmentModel");
const Audit = require("../models/auditModel");

const appointmentSchema = Joi.object({
  patientId: Joi.number().integer().positive().required(),
  doctorId: Joi.number().integer().positive().required(),
  appointmentDate: Joi.date().iso().required(),
  reason: Joi.string().min(3).max(255).required(),
  status: Joi.string().valid("scheduled", "completed", "cancelled").optional(),
});

async function create(req, res, next) {
  try {
    const value = await appointmentSchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    const appointment = await Appointment.createAppointment(value);
    try {
      await Audit.createAudit({
        userId: req.user?.sub,
        action: "create_appointment",
        entityType: "appointment",
        entityId: appointment.id,
        details: {
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id,
        },
      });
    } catch (e) {}
    return res
      .status(201)
      .json({ message: "Appointment created", data: appointment });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const appointments = await Appointment.getAppointments();
    return res.json({ data: appointments });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list };
