const express = require("express");
const PatientController = require("../controllers/patientController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "doctor", "nurse", "receptionist"), PatientController.getAll);
router.get("/:id", authorize("admin", "doctor", "nurse"), PatientController.getOne);
router.post("/", authorize("admin", "doctor", "nurse", "receptionist"), PatientController.create);

module.exports = router;
