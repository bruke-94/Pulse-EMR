const Joi = require("joi");
const Encounter = require("../models/encounterModel");
const Audit = require("../models/auditModel");

const encounterSchema = Joi.object({
  patientId: Joi.number().integer().positive().required(),
  clinicianId: Joi.number().integer().positive().required(),
  encounterDate: Joi.date().iso().required(),
  diagnosis: Joi.string().max(1000).allow("", null),
  notes: Joi.string().max(4000).allow("", null),
});

async function create(req, res, next) {
  try {
    const value = await encounterSchema.validateAsync(req.body ?? {}, {
      stripUnknown: true,
    });

    if (req.user && req.user.role !== "admin") {
      value.clinicianId = req.user.sub;
    }
    const encounter = await Encounter.createEncounter(value);
    try {
      await Audit.createAudit({
        userId: req.user?.sub,
        action: "create_encounter",
        entityType: "encounter",
        entityId: encounter.id,
        details: {
          patientId: encounter.patient_id,
          clinicianId: encounter.clinician_id,
        },
      });
    } catch (e) {}
    return res
      .status(201)
      .json({ message: "Patient history record created", data: encounter });
  } catch (error) {
    return next(error);
  }
}

async function listByPatient(req, res, next) {
  try {
    const patientId = Number(req.query.patientId);

    if (!patientId) {
      return res
        .status(400)
        .json({ message: "patientId query parameter is required" });
    }

    const isAdmin = req.user && req.user.role === "admin";
    const clinicianId = req.user ? req.user.sub : null;
    const encounters = await Encounter.getEncountersByPatientId(
      patientId,
      clinicianId,
      isAdmin,
    );
    return res.json({ data: encounters });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, listByPatient };
