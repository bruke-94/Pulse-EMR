const express = require("express");
const authRoutes = require("./authRoutes");
const patientRoutes = require("./patientRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const encounterRoutes = require("./encounterRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "emr-api" });
});

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/encounters", encounterRoutes);
router.use("/users", userRoutes);

module.exports = router;
