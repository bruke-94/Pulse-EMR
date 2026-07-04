const express = require("express");
const AppointmentController = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "doctor", "nurse", "receptionist"), AppointmentController.list);
router.post("/", authorize("admin", "doctor", "receptionist"), AppointmentController.create);

module.exports = router;
