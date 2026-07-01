const Joi = require("joi");
const Prescriptions = require("../models/prescriptionModel");
const Audit = require("../models/auditModel");

const prescriptionSchema = Joi.object({
  encounterId: Joi.number().integer().positive().required(),
  medicationName: Joi.string().max(150).required(),
  dosage: Joi.string().max(100).required(),
  frequency: Joi.string().max(100).required(),
  durationDays: Joi.number().integer().positive().required(),
  instructions: Joi.string().max(4000).allow("", null),
});

async function create(req, res, next) {
  try {
    const value = await prescriptionSchema.validateAsync(
      { ...req.body, encounterId: Number(req.params.encounterId) },
      { stripUnknown: true },
    );
    const record = await Prescriptions.createPrescription(value);
    try {
      await Audit.createAudit({
        userId: req.user?.sub,
        action: "create_prescription",
        entityType: "prescription",
        entityId: record.id,
        details: {
          encounterId: record.encounter_id,
          patientId: record.patient_id,
          clinicianId: record.clinician_id,
        },
      });
    } catch (error) {}
    return res
      .status(201)
      .json({ message: "Prescription saved", data: record });
  } catch (error) {
    return next(error);
  }
}

async function listByEncounter(req, res, next) {
  try {
    const encounterId = Number(req.params.encounterId);
    if (!encounterId) {
      return res.status(400).json({ message: "encounterId is required" });
    }

    const rows = await Prescriptions.getPrescriptionsByEncounterId(encounterId);
    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, listByEncounter };
