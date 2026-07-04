const express = require("express");
const EncounterController = require("../controllers/encounterController");
const VitalSignController = require("../controllers/vitalSignController");
const PrescriptionController = require("../controllers/prescriptionController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("admin", "doctor", "nurse"),
  EncounterController.listByPatient,
);
router.post("/", authorize("admin", "doctor"), EncounterController.create);
router.get(
  "/:encounterId/vitals",
  authorize("admin", "doctor"),
  VitalSignController.listByEncounter,
);
router.post(
  "/:encounterId/vitals",
  authorize("admin", "doctor"),
  VitalSignController.create,
);
router.get(
  "/:encounterId/prescriptions",
  authorize("admin", "doctor"),
  PrescriptionController.listByEncounter,
);
router.post(
  "/:encounterId/prescriptions",
  authorize("admin", "doctor"),
  PrescriptionController.create,
);

module.exports = router;
