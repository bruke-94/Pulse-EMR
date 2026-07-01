const Joi = require("joi");
const VitalSigns = require("../models/vitalSignModel");
const Audit = require("../models/auditModel");

const vitalSignsSchema = Joi.object({
  encounterId: Joi.number().integer().positive().required(),
  temperatureC: Joi.number().precision(1).allow(null),
  pulseBpm: Joi.number().integer().positive().allow(null),
  respiratoryRate: Joi.number().integer().positive().allow(null),
  systolicBp: Joi.number().integer().positive().allow(null),
  diastolicBp: Joi.number().integer().positive().allow(null),
  spo2Percent: Joi.number().integer().min(0).max(100).allow(null),
  recordedAt: Joi.date().iso().required(),
});

async function create(req, res, next) {
  try {
    const value = await vitalSignsSchema.validateAsync(
      { ...req.body, encounterId: Number(req.params.encounterId) },
      { stripUnknown: true },
    );
    const record = await VitalSigns.createVitalSigns(value);
    try {
      await Audit.createAudit({
        userId: req.user?.sub,
        action: "create_vital_signs",
        entityType: "vital_signs",
        entityId: record.id,
        details: {
          encounterId: record.encounter_id,
          patientId: record.patient_id,
          clinicianId: record.clinician_id,
        },
      });
    } catch (error) {}
    return res.status(201).json({ message: "Vital signs saved", data: record });
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

    const rows = await VitalSigns.getVitalSignsByEncounterId(encounterId);
    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, listByEncounter };
