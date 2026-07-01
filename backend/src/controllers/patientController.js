const Joi = require("joi");
const Patient = require("../models/patientModel");
const Audit = require("../models/auditModel");

const patientSchema = Joi.object({
  mrn: Joi.string().min(4).max(20).required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  dateOfBirth: Joi.date().required(),
  sex: Joi.string().valid("male", "female", "other").required(),
  phone: Joi.string().max(25).allow("", null),
  address: Joi.string().max(255).allow("", null),
});

async function getAll(req, res, next) {
  try {
    const patients = await Patient.getAllPatients();
    return res.json({ data: patients });
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const patient = await Patient.getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    return res.json({ data: patient });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const value = await patientSchema.validateAsync(req.body, {
      stripUnknown: true,
    });
    const patient = await Patient.createPatient(value);
    try {
      await Audit.createAudit({
        userId: req.user?.sub,
        action: "create_patient",
        entityType: "patient",
        entityId: patient.id,
        details: { mrn: patient.mrn },
      });
    } catch (e) {}
    return res.status(201).json({ message: "Patient created", data: patient });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getOne, create };
